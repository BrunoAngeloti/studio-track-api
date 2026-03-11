'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },

      studio_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'studios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      client: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      payment_method: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  },
};