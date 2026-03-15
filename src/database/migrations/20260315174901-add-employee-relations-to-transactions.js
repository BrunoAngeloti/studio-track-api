'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('transactions', 'responsible_employee_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    });

    await queryInterface.addColumn('transactions', 'repasse_employee_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('transactions', 'repasse_percentage', {
      type: Sequelize.DECIMAL(5,2),
      allowNull: true,
    });

  },

  async down(queryInterface) {

    await queryInterface.removeColumn('transactions', 'responsible_employee_id');
    await queryInterface.removeColumn('transactions', 'repasse_employee_id');
    await queryInterface.removeColumn('transactions', 'repasse_percentage');

  }
};