'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('repasses');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('repasses', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      studio_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      percentage: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
  }
};