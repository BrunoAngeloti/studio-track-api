'use strict';

// Uses raw SQL instead of queryInterface.changeColumn: Sequelize's Postgres
// changeColumn implementation doesn't touch NOT NULL when a `references`
// option is also present on a column that already has a FK constraint —
// it silently adds a *duplicate* FK constraint instead. Plain ALTER COLUMN
// avoids that footgun entirely.
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE transactions ALTER COLUMN responsible_employee_id DROP NOT NULL;'
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE transactions ALTER COLUMN responsible_employee_id SET NOT NULL;'
    );
  },
};
