'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('studios', 'stripe_customer_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('studios', 'stripe_subscription_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('studios', 'subscription_status', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('studios', 'trial_ends_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('studios', 'onboarding_completed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('studios', 'stripe_customer_id');
    await queryInterface.removeColumn('studios', 'stripe_subscription_id');
    await queryInterface.removeColumn('studios', 'subscription_status');
    await queryInterface.removeColumn('studios', 'trial_ends_at');
    await queryInterface.removeColumn('studios', 'onboarding_completed');
  },
};
