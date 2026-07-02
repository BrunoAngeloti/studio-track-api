const isLocalDatabase = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "");

const config = {
  dialect: 'postgres',
  url: process.env.DATABASE_URL,
  dialectOptions: isLocalDatabase ? {} : {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  define: {
    timestamps: true,
    underscored: true,
  },
};

export default config;