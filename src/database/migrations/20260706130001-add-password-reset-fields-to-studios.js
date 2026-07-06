'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('studios', 'password_reset_token_hash', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('studios', 'password_reset_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex('studios', ['password_reset_token_hash'], {
      name: 'studios_password_reset_token_hash_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('studios', 'studios_password_reset_token_hash_idx');
    await queryInterface.removeColumn('studios', 'password_reset_expires_at');
    await queryInterface.removeColumn('studios', 'password_reset_token_hash');
  },
};
