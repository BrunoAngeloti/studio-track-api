'use strict';

// Replaces the single `date` column with `start_date` + `end_date`, so one
// row can represent a whole period (month/range) instead of needing one row
// per day. A single-day exception is simply start_date === end_date.
// Existing rows are backfilled losslessly (start_date = end_date = date).
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('availability_overrides', 'start_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('availability_overrides', 'end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      'UPDATE availability_overrides SET start_date = date, end_date = date;'
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE availability_overrides ALTER COLUMN start_date SET NOT NULL;'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE availability_overrides ALTER COLUMN end_date SET NOT NULL;'
    );

    await queryInterface.removeIndex(
      'availability_overrides',
      'availability_overrides_studio_date_type_time_no_employee_uidx'
    );
    await queryInterface.removeIndex(
      'availability_overrides',
      'availability_overrides_studio_employee_date_type_time_uidx'
    );
    await queryInterface.removeIndex('availability_overrides', 'availability_overrides_studio_id_date');
    await queryInterface.removeIndex('availability_overrides', 'availability_overrides_studio_id_date_type');
    await queryInterface.removeIndex('availability_overrides', 'availability_overrides_studio_id_employee_id_date');

    await queryInterface.removeColumn('availability_overrides', 'date');

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX availability_overrides_studio_range_type_time_no_employee_uidx
      ON availability_overrides (studio_id, start_date, end_date, type, time)
      WHERE employee_id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX availability_overrides_studio_employee_range_type_time_uidx
      ON availability_overrides (studio_id, employee_id, start_date, end_date, type, time)
      WHERE employee_id IS NOT NULL;
    `);

    await queryInterface.addIndex('availability_overrides', ['studio_id', 'start_date', 'end_date'], {
      name: 'availability_overrides_studio_range_idx',
    });
    await queryInterface.addIndex('availability_overrides', ['studio_id', 'employee_id', 'start_date', 'end_date'], {
      name: 'availability_overrides_employee_range_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('availability_overrides', 'date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      'UPDATE availability_overrides SET date = start_date;'
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE availability_overrides ALTER COLUMN date SET NOT NULL;'
    );

    await queryInterface.removeIndex(
      'availability_overrides',
      'availability_overrides_studio_range_type_time_no_employee_uidx'
    );
    await queryInterface.removeIndex(
      'availability_overrides',
      'availability_overrides_studio_employee_range_type_time_uidx'
    );
    await queryInterface.removeIndex('availability_overrides', 'availability_overrides_studio_range_idx');
    await queryInterface.removeIndex('availability_overrides', 'availability_overrides_employee_range_idx');

    await queryInterface.removeColumn('availability_overrides', 'start_date');
    await queryInterface.removeColumn('availability_overrides', 'end_date');

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
    await queryInterface.addIndex('availability_overrides', ['studio_id', 'date']);
    await queryInterface.addIndex('availability_overrides', ['studio_id', 'date', 'type']);
    await queryInterface.addIndex('availability_overrides', ['studio_id', 'employee_id', 'date']);
  },
};
