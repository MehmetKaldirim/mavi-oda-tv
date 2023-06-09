const fs = require('fs');
const path = require('path');
const db = require('../models');
const filterFields = require('../utilities/filterFields');

const permittedFields = ['slug', 'title', 'body', 'thumbnailUrl'];


async function getArticles (req, res, next) {
  // ?page=1 (implicit default)
  // offset: 0
  //
  // ?page=2
  // offset: pageSize * (page - 1)
  const page = parseInt(req.query.page, 10) || 1;

  const pageSize = 3; // todo: make it 10
  const result = await db.Article.findAndCountAll({
    limit: pageSize,
    offset: pageSize * (page - 1),
    order: ['id']
  });
  const articles = result.rows;
  const totalPages = Math.ceil(result.count / pageSize);

  if (page > totalPages) {
    return res.status(422).send({ error: 'Unprocessable Entity' });
  }

  res.send({
    meta: {
      page,
      pageSize,
      totalPages,
    },
    items: articles
  });
}

async function getArticle (req, res) {
  const article = await db.Article.findOne({
    where: {
      slug: req.params.articleSlug
    }
  });

  if (!article) {
    return res.status(404).send({ error: 'Not Found' });
  }
  res.send(article);
}

async function createArticle(req, res) {
  // access the fields sent by the client & build an article with those values; save that and send back the created article, including an id in the response
  // (typically we permit only specific values, to prevent malicious actors from tampering with our system)
  // (also, we should validate the values)
  const newArticle = filterFields(req.body, permittedFields);

  const existingArticle = await db.Article.findOne({
    where: {
      slug: newArticle.slug
    }
  });

  if (existingArticle) {
    return res.status(422).send({ error: 'Article slug already exists' });
  }

  let article
  try {
    article = await db.Article.create(newArticle);
  }
  catch (error) {
    return res.status(422).send({ error: 'Unprocessable Entity' });
  }

  res.send(article);
}

async function updateArticle(req, res) {
  const existingArticle = await db.Article.findOne({
    where: {
      slug: req.params.articleSlug
    }
  });

  if (!existingArticle) {
    return res.status(404).send({ error: 'Not Found' });
  }

  const modifiedArticle = filterFields(req.body, permittedFields);
  let updatedArticle;
  try {
    updatedArticle = await existingArticle.update(modifiedArticle);
  }
  catch (error) {
    return res.status(422).send({ error: 'Unprocessable Entity' });
  }
  res.send(updatedArticle);
}

async function updateArticleImage(req, res) {
  // Update our database with metadata
  const article = await db.Article.findOne({
    where: {
      slug: req.params.articleSlug
    }
  });

  if (!article) {
    if (req.file) {
      const oldPath = path.join(__dirname, '..', 'uploads', req.file.filename);
      // Remove the file that was received
      fs.rmSync(oldPath);
    }

    return res.status(404).send({ error: 'Not Found' });
  }

  // Validate the file
  // For now: If bad, delete the file from uploads (add validations, etc to your liking here)
  if (!req.file) {
    return res.status(422).send({ error: 'Unprocessable Entity' });
  }

  // Store the file (right now we just move to public/ directory)
  const oldPath = path.join(__dirname, '..', 'uploads', req.file.filename);
  const newPath = path.join(__dirname, '..', 'public', 'images', req.file.filename)

  // left as exercise: handle errors
  try {
    fs.renameSync(oldPath, newPath);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }

  if (article.thumbnailUrl) {
    const thumbnailFilename = article.thumbnailUrl.replace('http://localhost:3001/assets/images/', '');
    const oldPublicPath = path.join(__dirname, '..', 'public', 'images', thumbnailFilename);
    fs.rmSync(oldPublicPath);
  }
  const thumbnailUrl = `http://localhost:3001/assets/images/${req.file.filename}`;
  await article.update({
    thumbnailUrl
  });

  res.send({
    thumbnailUrl
  });
}

module.exports = {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  updateArticleImage,
};