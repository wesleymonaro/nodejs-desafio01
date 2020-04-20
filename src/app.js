const express = require('express');
const cors = require('cors');
var HttpStatus = require('http-status-codes');

const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id))
    return response
      .status(HttpStatus.BAD_REQUEST)
      .json({ error: 'Invalid repo ID' });

  return next();
}

const repositories = [];

app.get('/repositories', (request, response) => {
  return response.json(repositories);
});

app.post('/repositories', (request, response) => {
  const { title, url, techs } = request.body;
  const repo = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };
  repositories.push(repo);
  return response.json(repo);
});

app.put('/repositories/:id', validateRepositoryId, (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const index = repositories.findIndex((repo) => repo.id === id);

  if (index < 0)
    return response
      .status(HttpStatus.BAD_REQUEST)
      .json({ error: 'Repo not found' });

  const repo = {
    id,
    title,
    url,
    techs,
    likes: repositories[index].likes,
  };

  repositories[index] = repo;
  return response.json(repo);
});

app.delete('/repositories/:id', validateRepositoryId, (request, response) => {
  const { id } = request.params;

  const index = repositories.findIndex((repo) => repo.id === id);

  if (index < 0)
    return response
      .status(HttpStatus.BAD_REQUEST)
      .json({ error: 'Repo not found' });

  repositories.splice(index, 1);

  return response.status(HttpStatus.NO_CONTENT).send();
});

app.post('/repositories/:id/like', (request, response) => {
  const { id } = request.params;

  const index = repositories.findIndex((repo) => repo.id === id);

  if (index < 0)
    return response
      .status(HttpStatus.BAD_REQUEST)
      .json({ error: 'Repo not found' });

  let repo = repositories[index];
  repo.likes += 1;
  repositories[index] = repo;

  return response.json(repo);
});

module.exports = app;
