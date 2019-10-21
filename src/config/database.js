require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
})

module.exports = {
  dialect: process.env.DB_SQL_DIALECT || 'postgres',
  host: process.env.DB_SQL_HOST,
  username: process.env.DB_SQL_USERNAME,
  password: process.env.DB_SQL_PASSWORD,
  database: process.env.DB_SQL_DATABASE_NAME,
  loggin: false,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true
  },
  storage: './__tests__/database.sqlite'
}
