'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.removeColumn('transactions', 'client');

    await queryInterface.addColumn('transactions', 'customer_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.addColumn('transactions', 'client', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn('transactions', 'customer_id');

  },
};