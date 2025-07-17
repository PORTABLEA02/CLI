const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

async function cloneRepo() {
  const dir = path.resolve('.'); // clone dans le sous-dossier 'zero'
  try {
    await git.clone({
      fs,
      http,
      dir,
      url: 'https://github.com/PORTABLEA02/cli.git',
      singleBranch: true,
      depth: 1,
    });
    console.log('✅ Clone réussi dans :', dir);
  } catch (err) {
    console.error('❌ Erreur lors du clone :', err.message || err);
  }
}

cloneRepo();