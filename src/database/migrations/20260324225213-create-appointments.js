'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
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
        onDelete: 'CASCADE',
      },

      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },

      service_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'services',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },

      responsible_employee_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'employees',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },

      scheduled_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      scheduled_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      requester_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      requester_phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      requester_phone_normalized: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
      },

      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      rejected_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      cancelled_at: {
        type: Sequelize.DATE,
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

  async down(queryInterface) {
    await queryInterface.dropTable('appointments');
  },
};