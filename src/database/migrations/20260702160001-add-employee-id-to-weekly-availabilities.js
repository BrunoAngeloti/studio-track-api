'use strict';

// Replaces the single unique index (studio_id, weekday, time) with two
// partial unique indexes, split on employee_id being NULL or not. A plain
// unique index would NOT work here: Postgres treats every NULL as distinct,
// so INDIVIDUAL studios (employee_id always NULL) would silently lose their
// existing duplicate-slot protection.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('weekly_availabilities', 'employee_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.removeIndex(
      'weekly_availabilities',
      'weekly_availabilities_studio_id_weekday_time'
    );

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX weekly_availabilities_studio_weekday_time_no_employee_uidx
      ON weekly_availabilities (studio_id, weekday, time)
      WHERE employee_id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX weekly_availabilities_studio_employee_weekday_time_uidx
      ON weekly_availabilities (studio_id, employee_id, weekday, time)
      WHERE employee_id IS NOT NULL;
    `);

    await queryInterface.addIndex('weekly_availabilities', ['studio_id', 'employee_id', 'weekday']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'weekly_availabilities',
      'weekly_availabilities_studio_employee_weekday_time_uidx'
    );

    await queryInterface.removeIndex(
      'weekly_availabilities',
      'weekly_availabilities_studio_weekday_time_no_employee_uidx'
    );

    await queryInterface.removeIndex(
      'weekly_availabilities',
      ['studio_id', 'employee_id', 'weekday']
    );

    await queryInterface.addIndex(
      'weekly_availabilities',
      ['studio_id', 'weekday', 'time'],
      { unique: true, name: 'weekly_availabilities_studio_id_weekday_time' }
    );

    await queryInterface.removeColumn('weekly_availabilities', 'employee_id');
  },
};
