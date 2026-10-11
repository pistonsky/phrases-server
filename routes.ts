import path from 'path';
import url from 'url';
import qs from 'qs';
import { Pool, QueryResult } from 'pg';
import axios from 'axios';
import Router from 'express-promise-router';
import graph from 'fbgraph';
import type { Request, Response } from 'express';
import config from './config/keys';
import { DEMO_USER_ID } from './config';

const router = new Router();

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const DEFAULT_DICTIONARY_NAME = 'Phrazes';

// tsc emits this file to dist/; the CRA client build stays at the repo root.
const projectRoot = path.join(__dirname, '..');

let pingChezeFailed = false;
let pingParklyFailed = false;

function env(name: string): string {
  return process.env[name] as string;
}

async function pingCheze(): Promise<void> {
  try {
    await axios.get(env('PING_URL_CHEZE'));
    if (pingChezeFailed) {
      try {
        await axios.post(env('SLACK_CHEZE_PING_BOT_URL'), {
          text: `✅ API Чем заняться поднялся!`,
        });
      } catch (slackError) {
        // do nothing
      }
    }
    pingChezeFailed = false;
    setTimeout(pingCheze, parseInt(env('PING_INTERVAL_MIN')) * 60 * 1000);
  } catch (error) {
    await axios.post(env('SLACK_CHEZE_PING_BOT_URL'), {
      text: `🚨 API Чем заняться лежит: ${error}\nurl: ${process.env.PING_URL_CHEZE}`,
    });
    pingChezeFailed = true;
    setTimeout(pingCheze, parseInt(env('PING_INTERVAL_MIN_IF_FAILED')) * 60 * 1000);
  }
}

async function pingParkly(): Promise<void> {
  try {
    const options = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    const result = await axios.get(env('PING_URL_PARKLY'), options);
    if (result.status !== 200) {
      throw new Error(`Статус код ${result.status}`);
    }
    if (!result.data) {
      throw new Error('Некорректный формат ответа');
    }
    if (!result.data.items) {
      throw new Error('В ответе нет ключа items');
    }
    if (!result.data.stories) {
      throw new Error('В ответе нет ключа stories');
    }
    if (!(result.data.items instanceof Array)) {
      throw new Error('Ключ items имеет некорректный формат (не массив)');
    }
    if (!(result.data.stories instanceof Array)) {
      throw new Error('Ключ stories имеет некорректный формат (не массив)');
    }
    let optionsCorrect = true;
    let badgesCorrect = true;
    let badgeTitle = true;
    let badgeColor = true;
    let pricesCorrect = true;
    let priceModePresent = true;
    let priceModeValidValue = true;
    let priceTopTextCorrect = true;
    let priceTopTextValueCorrect = true;
    let priceTopTextSuffixCorrect = true;
    let photosCorrect = true;
    let photoIdCorrect = true;
    let photoPublicPathCorrect = true;
    result.data.items.forEach((item: ParklyItem) => {
      if (!(item.options instanceof Array)) {
        optionsCorrect = false;
      }
      if (!(item.badges instanceof Array)) {
        badgesCorrect = false;
      } else {
        item.badges.forEach((badge) => {
          if (!badge.title) {
            badgeTitle = false;
          }
          if (!badge.color) {
            badgeColor = false;
          }
        });
      }
      if (!(item.prices instanceof Array)) {
        pricesCorrect = false;
      } else {
        item.prices.forEach((price) => {
          if (!price.mode) {
            priceModePresent = false;
          } else if (price.mode !== 'h' && price.mode !== 'd' && price.mode !== 'm') {
            priceModeValidValue = false;
          }
          if (!price.topText) {
            priceTopTextCorrect = false;
          } else {
            if (!price.topText.value) {
              priceTopTextValueCorrect = false;
            }
            if (typeof price.topText.suffix !== 'string') {
              priceTopTextSuffixCorrect = false;
            }
          }
        });
      }
      if (!(item.photos instanceof Array)) {
        photosCorrect = false;
      } else {
        item.photos.forEach((photo) => {
          if (!photo.id) {
            photoIdCorrect = false;
          }
          if (!photo.public_path) {
            photoPublicPathCorrect = false;
          }
        });
      }
    });
    if (
      !optionsCorrect ||
      !badgesCorrect ||
      !badgeTitle ||
      !badgeColor ||
      !pricesCorrect ||
      !priceModePresent ||
      !priceModeValidValue ||
      !priceTopTextCorrect ||
      !priceTopTextValueCorrect ||
      !priceTopTextSuffixCorrect ||
      !photosCorrect ||
      !photoIdCorrect ||
      !photoPublicPathCorrect
    ) {
      const error = {
        optionsCorrect,
        badgesCorrect,
        badgeTitle,
        badgeColor,
        pricesCorrect,
        priceModePresent,
        priceModeValidValue,
        priceTopTextCorrect,
        priceTopTextValueCorrect,
        priceTopTextSuffixCorrect,
        photosCorrect,
        photoIdCorrect,
        photoPublicPathCorrect,
      };
      const message = [];
      if (!optionsCorrect) {
        message.push('Ключ options в item имеет некорректный формат (не массив)');
      }
      if (!badgesCorrect) {
        message.push('Ключ badges в item имеет некорректный формат (не массив)');
      }
      if (!badgeTitle) {
        message.push('В каком-то (или всех) badge нет title');
      }
      if (!badgeColor) {
        message.push('В каком-то (или всех) badge нет color');
      }
      if (!pricesCorrect) {
        message.push('Ключ prices в item имеет некорректный формат (не массив)');
      }
      if (!priceModePresent) {
        message.push('В каком-то (или всех) price нет mode');
      }
      if (!priceModeValidValue) {
        message.push('Ключ mode в item/price имеет некорректный формат (не h/d/m)');
      }
      if (!priceTopTextCorrect) {
        message.push('В каком-то (или всех) item/price нет topText');
      }
      if (!priceTopTextValueCorrect) {
        message.push('В каком-то (или всех) item/price/topText нет value');
      }
      if (!priceTopTextSuffixCorrect) {
        message.push('В каком-то (или всех) item/price/topText тип suffix не строка');
      }
      if (!photosCorrect) {
        message.push('Ключ photos в item имеет некорректный формат (не массив)');
      }
      if (!photoIdCorrect) {
        message.push('В каком-то (или всех) item/photos нет id');
      }
      if (!photoPublicPathCorrect) {
        message.push('В каком-то (или всех) item/photos нет public_path');
      }
      throw new Error(message.map((m) => `\n>${m}`).join(''));
    }
    if (pingParklyFailed) {
      try {
        await axios.post(env('SLACK_PARKLY_PING_BOT_URL'), {
          text: `✅ api.parkly.ru поднялся!`,
        });
      } catch (slackError) {
        // do nothing
      }
    }
    pingParklyFailed = false;
    setTimeout(pingParkly, parseInt(env('PING_INTERVAL_MIN')) * 60 * 1000);
  } catch (error) {
    await axios.post(env('SLACK_PARKLY_PING_BOT_URL'), {
      text: `🚨 api.parkly.ru лежит: ${error}\nurl: ${process.env.PING_URL_PARKLY}`,
    });
    pingParklyFailed = true;
    setTimeout(pingParkly, parseInt(env('PING_INTERVAL_MIN_IF_FAILED')) * 60 * 1000);
  }
}

pingCheze();
// pingParkly();

interface PhraseQuery {
  user_id?: string;
  dictionary?: string;
  language?: string;
  original?: string;
  translated?: string;
  uri?: string;
  facebook_token?: string;
  id?: string;
  old_name?: string;
  new_name?: string;
}

interface ParklyItem {
  options?: unknown;
  badges?: { title?: string; color?: string }[];
  prices?: { mode?: string; topText?: { value?: string; suffix?: unknown } }[];
  photos?: { id?: string; public_path?: string }[];
}

async function sendPhrases({
  user_id,
  dictionary,
  res,
}: {
  user_id: string;
  dictionary?: string;
  res: Response;
}): Promise<void> {
  const result = await pool.query('select * from users where id = $1', [user_id]);
  if (result.rows.length === 0) {
    await pool.query('insert into users (id) values ($1)', [user_id]);
  }
  const conditions: { user_id: string; dictionary?: string } = { user_id };
  const conditionsQuery = ['user_id = $1'];
  if (dictionary) {
    conditions.dictionary = dictionary;
    conditionsQuery.push('dictionary = $2');
  }
  const phrasesResult = await pool.query(
    `select id, user_id, dictionary, language, original, translated, uri from phrases where ${conditionsQuery.join(
      ' and ',
    )}`,
    dictionary ? [user_id, dictionary] : [user_id],
  );
  res.json({
    ...conditions,
    phrases: phrasesResult.rows,
  });
}

function savedRowCount(result: QueryResult): number {
  return result.rowCount ?? 0;
}

router.get('/connect_facebook', function (req: Request, res: Response) {
  const { facebook_token, user_id } = req.query as PhraseQuery;
  graph.get('me?access_token=' + facebook_token, async (err, response) => {
    if (err) {
      res.status(503).send();
    } else {
      const { id } = response;
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
            await pool.query(
              `update phrases set user_id = $1 where user_id in (${placeholders.join(', ')})`,
              linked_users.rows.map((row) => row.id),
            );
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
            await pool.query(`update phrases set user_id = $1 where user_id in (${placeholders.join(', ')})`, [
              final_user_id,
              ...users.rows.map((row) => row.id),
            ]);
            // remove all other users
            await pool.query('delete from users where facebook_user_id = $1 and id != $2', [id, final_user_id]);
            await sendPhrases({ user_id: final_user_id, res });
          } else {
            // no user with this facebook account - create one
            const new_user_id = Math.random().toString(36).slice(2);
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

router.get('/demo', async (req: Request, res: Response) => {
  await sendPhrases({ user_id: DEMO_USER_ID, res });
});

router.get(['/', '/phrazes'], async (req: Request, res: Response) => {
  const { user_id, dictionary } = req.query as PhraseQuery;
  if (user_id) {
    await sendPhrases({ user_id, dictionary, res });
  } else {
    res.sendFile(path.join(projectRoot, 'client', 'build', 'index.html'));
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { user_id, dictionary, language, original, translated, uri } = req.query as PhraseQuery;
  const users = await pool.query('select id from users where id = $1', [user_id]);
  if (users.rows.length === 0) {
    await pool.query('insert into users (id) values ($1)', [user_id]);
  }
  try {
    const values: unknown[] = [user_id, uri];
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
    const updateResult = await pool.query(
      `update phrases set ${columns.join(', ')} where user_id = $1 and uri = $2`,
      values,
    );
    if (savedRowCount(updateResult) > 0) {
      res.status(200).json({ updated: updateResult.rowCount });
    } else {
      const phrase = {
        user_id,
        dictionary: dictionary || DEFAULT_DICTIONARY_NAME,
        language,
        original,
        translated,
        uri,
      };
      const insertResult = await pool.query(
        `insert into phrases (user_id, dictionary, language, original, translated, uri) values ($1, $2, $3, $4, $5, $6)`,
        [user_id, dictionary || DEFAULT_DICTIONARY_NAME, language, original, translated, uri],
      );
      if (savedRowCount(insertResult) > 0) {
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

router.delete('/', async (req: Request, res: Response) => {
  const { uri } = req.query as PhraseQuery;
  try {
    await pool.query('delete from phrases where uri = $1', [uri]);
    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

router.get('/share', function (req: Request, res: Response) {
  const query = url.parse(req.url).query;
  res.redirect('phrazesapp://+' + query);
});

router.delete('/dictionary', async (req: Request, res: Response) => {
  const { id, user_id } = req.query as PhraseQuery;
  try {
    await pool.query('delete from phrases where user_id = $1 and dictionary = $2', [user_id, id]);
    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

router.put('/dictionary', async (req: Request, res: Response) => {
  const { old_name, new_name } = req.query as PhraseQuery;
  try {
    const result = await pool.query('update phrases set dictionary = $1 where dictionary = $2', [new_name, old_name]);
    res.status(200).json({ updated: result.rowCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
});

router.get('/privacy', async (req: Request, res: Response) => {
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

router.get('/privacy/ru', async (req: Request, res: Response) => {
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

router.get('*', async (req: Request, res: Response) => {
  const query = qs.parse(req.params[0].replace('/phrazesapp://+', '')) as PhraseQuery;
  if (query.dictionary) {
    const result = await pool.query('select count(*) as count from phrases where user_id = $1 and dictionary = $2', [
      query.user_id,
      query.dictionary,
    ]);
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

export = router;
