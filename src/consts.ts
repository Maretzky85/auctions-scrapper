export const allegroCredentials = {
  headers: {
    Authorization: "Allegro token here"
  },
  params: {
    // eslint-disable-next-line @typescript-eslint/camelcase
    grant_type: "client_credentials"
  }
}

export const postgresConfig = {
  host: 'db ip',
  port: 5432,
  database: 'db name',
  user: 'db user',
  password: 'db pass'
}