// Marca um estudio como tendo acesso vitalicio gratis (sem precisar de
// assinatura ativa no Stripe). Usado via scripts/grant-lifetime-access.sh.

const { Client } = require('pg');

async function main() {
  const email = process.argv[2];
  const databaseUrl = process.env.DATABASE_URL;

  if (!email) {
    console.error('Uso: node grant-lifetime-access.js <email>');
    process.exit(1);
  }

  if (!databaseUrl) {
    console.error('Erro: DATABASE_URL nao definida.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const result = await client.query(
      `UPDATE studios
       SET lifetime_free_access = true, updated_at = now()
       WHERE email = $1
       RETURNING id, name, email, subscription_status, onboarding_completed, lifetime_free_access`,
      [email]
    );

    if (result.rowCount === 0) {
      console.error(`Nenhum estudio encontrado com o email "${email}".`);
      process.exit(1);
    }

    console.log('Estudio atualizado:');
    console.log(result.rows[0]);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Erro ao atualizar estudio:', error.message);
  process.exit(1);
});
