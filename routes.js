const Router = require('express-promise-router');
var path = require('path');
var url = require('url');
var qs = require('qs');
const { Pool } = require('pg');
var graph = require('fbgraph');
const axios = require('axios');
var config = require('./config/keys');
var { DEMO_USER_ID } = require('./config');

const router = new Router();

const pool = new Pool({ connectionString: config.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const DEFAULT_DICTIONARY_NAME = 'Phrazes';

let pingChezeFailed = false;

async function pingCheze() {
  try {
    await axios.get(process.env.PING_URL_CHEZE);
    if (pingChezeFailed) {
      try {
        await axios.post(process.env.SLACK_CHEZE_PING_BOT_URL, {
          text: `✅ API Чем заняться поднялся!`,
        });
      } catch (slackError) {
        // do nothing
      }
    }
    pingChezeFailed = false;
    setTimeout(pingCheze, parseInt(process.env.PING_INTERVAL_MIN) * 60 * 1000);
  } catch (error) {
    await axios.post(process.env.SLACK_CHEZE_PING_BOT_URL, {
      text: `🚨 API Чем заняться лежит: ${error}\nurl: ${process.env.PING_URL_CHEZE}`,
    });
    pingChezeFailed = true;
    setTimeout(pingCheze, parseInt(process.env.PING_INTERVAL_MIN_IF_FAILED) * 60 * 1000);
  }
}

pingCheze();

async function sendPhrases({ user_id, dictionary, res }) {
  const result = await pool.query('select * from users where id = $1', [user_id]);
  if (result.rows.length === 0) {
    await pool.query('insert into users (id) values ($1)', [user_id]);
  }
  let conditions = { user_id };
  const conditionsQuery = ['user_id = $1'];
  if (dictionary) {
    conditions.dictionary = dictionary;
    conditionsQuery.push('dictionary = $2');
  }
  const phrasesResult = await pool.query(`select id, user_id, dictionary, language, original, translated, uri from phrases where ${conditionsQuery.join(' and ')}`, dictionary ? [user_id, dictionary] : [user_id]);
  res.json({
    ...conditions,
    phrases: phrasesResult.rows,
  });
}

router.get('/connect_facebook', function(req, res) {
  const { facebook_token, user_id } = req.query;
  graph.get('me?access_token=' + facebook_token, async (err, response) => {
    if (err) {
      res.status(503).send();
    } else {
      const { name, id } = response;
      let users;
      try {
        if (user_id) {
          // add this facebook account to the current user
          // if this facebook account is already used, then merge both accounts into current and delete the old one
          const linked_users = await pool.query('select id from users where facebook_user_id = $1', [id]);
          if (linked_users.rows.length === 0) {
            // no accounts linked yet
            users = await pool.query('select id from users where id = $1', [user_id]);
            if (users.rows.length === 1) {
              await pool.query('update users set facebook_user_id = $1 where id = $2', [id, user_id]);
              await sendPhrases({ user_id, res });
            } else {
              await pool.query('insert into users (id, facebook_user_id) values ($1, $2)', [user_id, id]);
              await sendPhrases({ user_id, res });
            }
          } else {
            // there is one or more linked accounts already
            // add all phrases of linked accounts to the current user
            const placeholders = [];
            for (let i = 0; i < linked_users.rows.length; i += 1) {
              placeholders.push(`$${i + 2}`);
            }
            await pool.query(`update phrases set user_id = $1 where user_id in (${placeholders.join(', ')})`, linked_users.rows.map((row) => row.id));
            // remove all other users
            await pool.query('delete from users where facebook_user_id = $1 and id != $2', [id, user_id]);
            // make sure current user is connected to facebook
            const user = await pool.query('select id from users where id = $1', [user_id]);
            if (user.rows.length > 0) {
              await pool.query('update users set facebook_user_id = $1 where id = $2', [id, user_id]);
            } else {
              await pool.query('insert into users (id, facebook_user_id) values ($1, $2)', [user_id, id]);
            }
            await sendPhrases({ user_id, res });
          }
        } else {
          // login with facebook
          users = await pool.query('select id from users where facebook_user_id = $1', [id]);
          if (users.rows.length > 0) {
            const final_user_id = users.rows[0].id; // merge all users into first one
            const placeholders = [];
            for (let i = 0; i < users.rows.length; i += 1) {
              placeholders.push(`$${i + 2}`);
            }
            await pool.query(`update phrases set user_id = $1 where user_id in (${placeholders.join(', ')})`, [final_user_id, ...users.rows.map((row) => row.id)]);
            // remove all other users
            await pool.query('delete from users where facebook_user_id = $1 and id != $2', [id, final_user_id]);
            await sendPhrases({ user_id: final_user_id, res });
          } else {
            // no user with this facebook account - create one
            const new_user_id = Math.random()
              .toString(36)
              .slice(2);
            await pool.query('insert into users (id, facebook_user_id) values ($1, $2)', [new_user_id, id]);
            res.json({ user_id: new_user_id, phrases: [] });
          }
        }
      } catch (error) {
        res.status(500).json({});
      }
    }
  });
});

router.get('/demo', async (req, res) => {
  await sendPhrases({ user_id: DEMO_USER_ID, res });
});

router.get(['/', '/phrazes'], async (req, res) => {
  const { user_id, dictionary } = req.query;
  if (user_id) {
    await sendPhrases({ user_id, dictionary, res });
  } else {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  }
});

router.post('/', async (req, res) => {
  const {
    user_id,
    dictionary,
    language,
    original,
    translated,
    uri
  } = req.query;
  const users = await pool.query('select id from users where id = $1', [user_id]);
  if (users.rows.length === 0) {
    await pool.query('insert into users (id) values ($1)', [user_id]);
  }
  try {
    const values = [user_id, uri];
    const columns = [];
    if (original) {
      columns.push(`original = $${3 + columns.length}`);
      values.push(original);
    }
    if (translated) {
      columns.push(`translated = $${3 + columns.length}`);
      values.push(translated);
    }
    if (dictionary) {
      columns.push(`dictionary = $${3 + columns.length}`);
      values.push(dictionary);
    }
    if (language) {
      columns.push(`language = $${3 + columns.length}`);
      values.push(language);
    }
    const updateResult = await pool.query(`update phrases set ${columns.join(', ')} where user_id = $1 and uri = $2`, values);
    if (updateResult.rowCount > 0) {
      res.status(200).json({ updated: updateResult.rowCount });
    } else {
      const phrase = {
        user_id,
        dictionary: dictionary || DEFAULT_DICTIONARY_NAME,
        language,
        original,
        translated,
        uri
      };
      const insertResult = await pool.query(`insert into phrases (user_id, dictionary, language, original, translated, uri) values ($1, $2, $3, $4, $5, $6)`, [user_id, dictionary || DEFAULT_DICTIONARY_NAME, language, original, translated, uri]);
      if (insertResult.rowCount > 0) {
        res.status(200).json(phrase);
      } else {
        res.status(500).json({ error: 'Could not save phrase', phrase });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

router.delete('/', async (req, res) => {
  const { uri } = req.query;
  try {
    await pool.query('delete from phrases where uri = $1', [uri]);
    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

router.get('/share', function(req, res) {
  const query = url.parse(req.url).query;
  res.redirect('phrazesapp://+' + query);
});

router.delete('/dictionary', async (req, res) => {
  const { id, user_id } = req.query;
  try {
    await pool.query('delete from phrases where user_id = $1 and dictionary = $2', [user_id, id]);
    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

router.put('/dictionary', async (req, res) => {
  const { old_name, new_name, user_id } = req.query;
  try {
    const result = await pool.query('update phrases set dictionary = $1 where dictionary = $2', [new_name, old_name]);
    res.status(200).json({ updated: result.rowCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

router.get('/privacy', async (req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <title>Privacy Policy</title>
        <meta name="description"  content="Phrazes app privacy policy" />
      </head>
      <body>
        <h1>Phrazes app Privacy Policy</h1>
        <p>All phrases created by users are currently only available for users that created those phrases.</p>
        <p>We do not disclose any information about our users. We do not publicly show which phrases were created by our users.</p>
        <p>However, we reserve the right to publish any phrase later, without stating the author of published phrases.</p>
      </body>
    </html>
  `);
});

router.get('/privacy/ru', async (req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <title>Политика конфиденциальности</title>
        <meta name="description"  content="Политика конфиденциальности приложения Phrazes" />
      </head>
      <body>
        <h1>Политика конфиденциальности приложения «Phrazes»</h1>
        <p>Все фразы, созданные пользователем, на текущий момент доступны только пользователю, создавшему эти фразы.</p>
        <p>Мы не раскрываем третим лицам никакую информацию о наших пользователях. Мы не показываем публично какие фразы были созданы нашими пользователями. Мы не собираем никакие персональные данные о пользователях. Каждому пользователю присваивается анонимный идентификатор (случайная строка из символов), который используется в нашей базе данных для указания принадлежности фраз пользователям.</p>
        <p>Однако, мы оставляем за собой право публиковать отдельные фразы пользователей без ссылки на их авторство, то есть анонимно.</p>
      </body>
    </html>
  `);
});

router.get('*', async (req, res) => {
  const query = qs.parse(req.params[0].replace('/phrazesapp://+', ''));
  if (query.dictionary) {
    const result = await pool.query('select count(*) as count from phrases where user_id = $1 and dictionary = $2', [query.user_id, query.dictionary]);
    res.status(200).send(`
      <html>
        <head>
          <title>${query.dictionary}</title>
          <meta name="description"  content="Learn ${result.rows[0].count} phrases now in Phrazes app!" />
          <meta property="og:title" content="${query.dictionary}" />
          <meta property="og:description" content="Learn ${result.rows[0].count} phrases now in Phrazes app!" />
          <meta property="og:image" content="https://pistonsky-phrases.herokuapp.com/phrazes.png" />
          <meta property="og:image:width" content="1024" />
          <meta property="og:image:height" content="1024" />
          <meta property="og:url" content="pistonsky-phrases.herokuapp.com" />
          <meta property="og:type" content="website" />
          <meta property="fb:app_id" content="672834932920089" />
        </head>
        <body>
        </body>
      </html>
    `);
  } else {
    if (query.original) {
      res.status(200).send(`
        <html>
          <head>
            <title>${query.original} -> ${query.translated}</title>
            <meta property="og:title" content="${query.original} -> ${query.translated}" />
            <meta name="description"  content="Learn this phrase now in Phrazes app!" />
            <meta property="og:description" content="Learn this phrase now in Phrazes app!" />
            <meta property="og:image" content="https://pistonsky-phrases.herokuapp.com/phrazes.png" />
            <meta property="og:image:width" content="1024" />
            <meta property="og:image:height" content="1024" />
            <meta property="og:url" content="pistonsky-phrases.herokuapp.com" />
            <meta property="og:type" content="website" />
            <meta property="fb:app_id" content="672834932920089" />
          </head>
          <body>
          </body>
        </html>
      `);
    } else {
      const result = await pool.query('select count(*) as count from phrases where user_id = $1', [query.user_id]);
      res.status(200).send(`
        <html>
          <head>
            <title>Phrazes: speak like a local!</title>
            <meta property="og:title" content="Phrazes: speak like a local!" />
            <meta name="description"  content="Learn these ${result.rows[0].count} phrases now in Phrazes app!" />
            <meta property="og:description" content="Learn these ${result.rows[0].count} phrases now in Phrazes app!" />
            <meta property="og:image" content="https://pistonsky-phrases.herokuapp.com/phrazes.png" />
            <meta property="og:image:width" content="1024" />
            <meta property="og:image:height" content="1024" />
            <meta property="og:url" content="pistonsky-phrases.herokuapp.com" />
            <meta property="og:type" content="website" />
            <meta property="fb:app_id" content="672834932920089" />
          </head>
          <body>
          </body>
        </html>
      `);
    }
  }
});

module.exports = router;
