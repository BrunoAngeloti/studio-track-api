const config = {
  dialect: 'postgres',
  username: 'postgres',
  password: 'postgres',
  database: 'studiotrack',
  host: '127.0.0.1',
  port: 5432,
  define: {
    timestamps: true,
    underscored: true,
  },
};

export default config;