import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import CreateOSDWizardPage from '../../pageobjects/CreateOSDWizard.page';

const clusterProfiles = require('../../fixtures/osd-aws/OsdNonCcsAWSClusterCreate.json');
const clusterProperties = clusterProfiles['osd-nonccs-aws-public']['day1-profile'];

describe(
  'OSD NonCCS AWS public cluster creation profile',
  { tags: ['day1', 'aws', 'public', 'multizone', 'osd', 'nonccs'] },
  () => {
    before(() => {
      cy.visit('/create');
    });

    it(`Launch OSD(nonccs) - ${clusterProperties.CloudProvider} - ${clusterProperties.ClusterPrivacy} cluster wizard`, () => {
      CreateOSDWizardPage.osdCreateClusterButton().click();
      CreateOSDWizardPage.isCreateOSDPage();
    });

    it(`OSD(nonccs)-  ${clusterProperties.CloudProvider} -${clusterProperties.ClusterPrivacy} - wizard - Billing model`, () => {
      CreateOSDWizardPage.isBillingModelScreen();
      CreateOSDWizardPage.subscriptionTypeAnnualFixedCapacityRadio().should('be.checked');
      CreateOSDWizardPage.infrastructureTypeRedHatCloudAccountRadio().check();
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD(nonccs)-  ${clusterProperties.CloudProvider} -${clusterProperties.ClusterPrivacy}- Cluster Settings - Cloud provider`, () => {
      CreateOSDWizardPage.isCloudProviderSelectionScreen();
      CreateOSDWizardPage.selectCloudProvider(clusterProperties.CloudProvider);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD(nonccs)-  ${clusterProperties.CloudProvider} -${clusterProperties.ClusterPrivacy} - Cluster Settings - Cluster details`, () => {
      CreateOSDWizardPage.isClusterDetailsScreen();
      CreateOSDWizardPage.setClusterName(clusterProperties.ClusterName);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.createCustomDomainPrefixCheckbox().check();
      CreateOSDWizardPage.setDomainPrefix(clusterProperties.DomainPrefix);
      CreateOSDWizardPage.closePopoverDialogs();
      CreateOSDWizardPage.selectAvailabilityZone(clusterProperties.Availability);
      CreateOSDWizardPage.selectRegion(clusterProperties.Region);
      CreateOSDWizardPage.selectPersistentStorage(clusterProperties.PersistentStorage);
      CreateOSDWizardPage.selectLoadBalancers(clusterProperties.LoadBalancers);
      CreateOSDWizardPage.enableUserWorkloadMonitoringCheckbox().should('be.checked');
      if (clusterProperties.AdditionalEncryption.includes('Enabled')) {
        CreateOSDWizardPage.advancedEncryptionLink().click();
        CreateOSDWizardPage.enableAdditionalEtcdEncryptionCheckbox().check();
        if (clusterProperties.FIPSCryptography.includes('Enabled')) {
          CreateOSDWizardPage.enableFIPSCryptographyCheckbox().check();
        }
      }
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD(nonccs) ${clusterProperties.CloudProvider}-${clusterProperties.ClusterPrivacy} - Cluster Settings - Default machinepool`, () => {
      CreateOSDWizardPage.isMachinePoolScreen();
      CreateOSDWizardPage.selectComputeNodeType(clusterProperties.MachinePools.InstanceType);
      if (clusterProperties.MachinePools.Autoscaling.includes('Enabled')) {
        CreateOSDWizardPage.enableAutoscalingCheckbox().check({ force: true });
        CreateOSDWizardPage.setMinimumNodeCount(clusterProperties.MachinePools.MinimumNodeCount);
        CreateOSDWizardPage.setMaximumNodeCount(clusterProperties.MachinePools.MaximumNodeCount);
      } else {
        CreateOSDWizardPage.enableAutoscalingCheckbox().should('not.be.checked');
        CreateOSDWizardPage.selectComputeNodeCount(clusterProperties.MachinePools.NodeCount);
      }
      if (clusterProperties.MachinePools.hasOwnProperty('NodeLabel')) {
        CreateOSDWizardPage.addNodeLabelLink().click();
        CreateOSDWizardPage.addNodeLabelKeyAndValue(
          clusterProperties.MachinePools.NodeLabel[0].Key,
          clusterProperties.MachinePools.NodeLabel[0].Value,
          0,
        );
      }
      CreateOSDWizardPage.wizardNextButton().click();
    });

    if (!clusterProperties.CloudProvider.includes('GCP')) {
      it(`OSD(nonccs) ${clusterProperties.CloudProvider} -${clusterProperties.ClusterPrivacy} Networking configuration - cluster privacy`, () => {
        CreateOSDWizardPage.isNetworkingScreen();
        CreateOSDWizardPage.clusterPrivacyPublicRadio().should('be.checked');
        CreateOSDWizardPage.clusterPrivacyPrivateRadio().should('not.be.checked');
        CreateOSDWizardPage.selectClusterPrivacy(clusterProperties.ClusterPrivacy);
        CreateOSDWizardPage.wizardNextButton().click();
      });
    }

    it(`OSD(nonccs) ${clusterProperties.CloudProvider}-${clusterProperties.ClusterPrivacy} - Networking configuration - CIDR `, () => {
      CreateOSDWizardPage.isCIDRScreen();
      CreateOSDWizardPage.cidrDefaultValuesCheckBox().should('be.checked');
      CreateOSDWizardPage.machineCIDRInput().should('have.value', clusterProperties.MachineCIDR);
      CreateOSDWizardPage.serviceCIDRInput().should('have.value', clusterProperties.ServiceCIDR);
      CreateOSDWizardPage.podCIDRInput().should('have.value', clusterProperties.PodCIDR);
      CreateOSDWizardPage.hostPrefixInput().should('have.value', clusterProperties.HostPrefix);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD(nonccs) ${clusterProperties.CloudProvider} - ${clusterProperties.ClusterPrivacy}  wizard - Cluster updates `, () => {
      CreateOSDWizardPage.isUpdatesScreen();
      CreateOSDWizardPage.updateStrategyIndividualRadio().should('be.checked');
      CreateOSDWizardPage.updateStrategyRecurringRadio().should('not.be.checked');
      if (clusterProperties.UpdateStrategy.includes('Recurring')) {
        CreateOSDWizardPage.updateStrategyRecurringRadio().check();
      } else {
        CreateOSDWizardPage.updateStrategyIndividualRadio().check();
      }
      CreateOSDWizardPage.selectNodeDraining(clusterProperties.NodeDraining);
      CreateOSDWizardPage.wizardNextButton().click();
    });

    it(`OSD(nonccs) ${clusterProperties.CloudProvider} - ${clusterProperties.ClusterPrivacy}  - Review and create page`, () => {
      CreateOSDWizardPage.isReviewScreen();
      CreateOSDWizardPage.subscriptionTypeValue().contains(clusterProperties.SubscriptionType);
      CreateOSDWizardPage.infrastructureTypeValue().contains(clusterProperties.InfrastructureType);
      CreateOSDWizardPage.cloudProviderValue().contains(clusterProperties.CloudProvider);
      CreateOSDWizardPage.clusterNameValue().contains(clusterProperties.ClusterName);
      CreateOSDWizardPage.regionValue().contains(clusterProperties.Region.split(',')[0]);
      CreateOSDWizardPage.availabilityValue().contains(clusterProperties.Availability);
      CreateOSDWizardPage.userWorkloadMonitoringValue().contains(
        clusterProperties.UserWorkloadMonitoring,
      );
      CreateOSDWizardPage.persistentStorageValue().contains(clusterProperties.PersistentStorage);
      CreateOSDWizardPage.additionalEtcdEncryptionValue().contains(
        clusterProperties.AdditionalEncryption,
      );
      CreateOSDWizardPage.fipsCryptographyValue().contains(clusterProperties.FIPSCryptography);
      CreateOSDWizardPage.nodeInstanceTypeValue().contains(
        clusterProperties.MachinePools.InstanceType,
      );
      CreateOSDWizardPage.autoscalingValue().contains(clusterProperties.MachinePools.Autoscaling);
      if (clusterProperties.MachinePools.Autoscaling.includes('Enabled')) {
        CreateOSDWizardPage.computeNodeRangeValue().contains(
          `Minimum nodes per zone: ${clusterProperties.MachinePools.MinimumNodeCount}`,
        );
        CreateOSDWizardPage.computeNodeRangeValue().contains(
          `Maximum nodes per zone: ${clusterProperties.MachinePools.MaximumNodeCount}`,
        );
      } else {
        CreateOSDWizardPage.computeNodeCountValue().contains(
          clusterProperties.MachinePools.NodeCount,
        );
      }
      CreateOSDWizardPage.clusterPrivacyValue().contains(clusterProperties.ClusterPrivacy);
      CreateOSDWizardPage.machineCIDRValue().contains(clusterProperties.MachineCIDR);
      CreateOSDWizardPage.serviceCIDRValue().contains(clusterProperties.ServiceCIDR);
      CreateOSDWizardPage.podCIDRValue().contains(clusterProperties.PodCIDR);
      CreateOSDWizardPage.hostPrefixValue().contains(clusterProperties.HostPrefix);
      CreateOSDWizardPage.updateStratergyValue().contains(clusterProperties.UpdateStrategy);
      CreateOSDWizardPage.nodeDrainingValue(
        `${clusterProperties.NodeDraining} × 60 = ${clusterProperties.NodeDraining} minutes`,
      );
    });

    it(`OSD(nonccs) ${clusterProperties.CloudProvider} - ${clusterProperties.ClusterPrivacy} - Cluster submissions`, () => {
      CreateOSDWizardPage.createClusterButton().click();
      ClusterDetailsPage.waitForInstallerScreenToLoad();
      ClusterDetailsPage.clusterNameTitle().contains(clusterProperties.ClusterName);
      ClusterDetailsPage.clusterInstallationHeader()
        .contains('Installing cluster')
        .should('be.visible');
      ClusterDetailsPage.clusterInstallationExpectedText()
        .contains('Cluster creation usually takes 30 to 60 minutes to complete')
        .should('be.visible');
      ClusterDetailsPage.downloadOcCliLink().contains('Download OC CLI').should('be.visible');
      ClusterDetailsPage.clusterDetailsPageRefresh();
      ClusterDetailsPage.checkInstallationStepStatus('Account setup');
      ClusterDetailsPage.checkInstallationStepStatus('Network settings');
      ClusterDetailsPage.checkInstallationStepStatus('DNS setup');
      ClusterDetailsPage.checkInstallationStepStatus('Cluster installation');
      ClusterDetailsPage.clusterTypeLabelValue().contains(clusterProperties.Type);
    });
  },
);
