'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('studios', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('studios', 'primary_color', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('studios', 'secondary_color', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('studios', 'phone');
    await queryInterface.removeColumn('studios', 'primary_color');
    await queryInterface.removeColumn('studios', 'secondary_color');
  },
};