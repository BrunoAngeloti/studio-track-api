'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('studios', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'INDIVIDUAL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('studios', 'type');
  },
};
