'use strict';

// Same partial-unique-index split as weekly_availabilities — see that
// migration's comment for why a plain unique index doesn't work here.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('availability_overrides', 'employee_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.removeIndex(
      'availability_overrides',
      'availability_overrides_studio_id_date_type_time'
    );

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX availability_overrides_studio_date_type_time_no_employee_uidx
      ON availability_overrides (studio_id, date, type, time)
      WHERE employee_id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX availability_overrides_studio_employee_date_type_time_uidx
      ON availability_overrides (studio_id, employee_id, date, type, time)
      WHERE employee_id IS NOT NULL;
    `);

    await queryInterface.addIndex('availability_overrides', ['studio_id', 'employee_id', 'date']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'availability_overrides',
      'availability_overrides_studio_employee_date_type_time_uidx'
    );

    await queryInterface.removeIndex(
      'availability_overrides',
      'availability_overrides_studio_date_type_time_no_employee_uidx'
    );

    await queryInterface.removeIndex(
      'availability_overrides',
      ['studio_id', 'employee_id', 'date']
    );

    await queryInterface.addIndex(
      'availability_overrides',
      ['studio_id', 'date', 'type', 'time'],
      { unique: true, name: 'availability_overrides_studio_id_date_type_time' }
    );

    await queryInterface.removeColumn('availability_overrides', 'employee_id');
  },
};
