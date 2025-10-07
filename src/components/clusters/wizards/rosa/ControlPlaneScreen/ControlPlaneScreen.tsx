import React from 'react';
import { Field } from 'formik';

import {
  Content,
  ContentVariants,
  Form,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { clusterBillingModelToRelatedResource } from '~/components/clusters/common/billingModelMapper';
import { QuotaTypes } from '~/components/clusters/common/quotaModel';
import { availableQuota } from '~/components/clusters/common/quotaSelectors';
import { emptyAWSSubnet } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { PrerequisitesInfoBox } from '~/components/clusters/wizards/rosa/common/PrerequisitesInfoBox';
import { WelcomeMessage } from '~/components/clusters/wizards/rosa/common/WelcomeMessage';
import ExternalLink from '~/components/common/ExternalLink';
import { MULTIREGION_PREVIEW_ENABLED } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { useGlobalState } from '~/redux/hooks';
import AWSLogo from '~/styles/images/AWS.png';
import RedHat from '~/styles/images/Logo-Red_Hat-B-Standard-RGB.png';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import { NO_ROLE_DETECTED } from '../AccountsRolesScreen/AccountRolesARNsSection/AccountRolesARNsSection';
import { RosaArchitectureRenamingAlert } from '../common/Banners/RosaArchitectureRenamingAlert';
import { FieldId, initialValuesHypershift } from '../constants';

import { hypershiftValue } from './ControlPlaneCommon';
import { HostedTile } from './HostedTile';
import { StandAloneTile } from './StandAloneTile';

type ControlPlaneFieldProps = {
  input: {
    value: hypershiftValue;
    onChange: (value: hypershiftValue) => void;
  };
  hasHostedProductQuota: boolean;
};

const ControlPlaneField = ({
  input: { value, onChange },
  hasHostedProductQuota,
}: ControlPlaneFieldProps) => {
  const { values: formValues, setValues, setFieldValue } = useFormState();
  const isHostedDisabled = !hasHostedProductQuota;
  const isMultiRegionEnabled = useFeatureGate(MULTIREGION_PREVIEW_ENABLED);

  React.useEffect(() => {
    if (isHostedDisabled) {
      onChange('false');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (value === 'true' && isMultiRegionEnabled) {
      setFieldValue(FieldId.Region, undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (isHypershift: hypershiftValue) => {
    onChange(isHypershift);

    setValues({
      ...formValues,
      ...initialValuesHypershift(isHypershift === 'true', isMultiRegionEnabled),
      [FieldId.Hypershift]: isHypershift,
      // Uncheck the following Network checkboxes when switching Control plane selection
      [FieldId.InstallToVpc]: false,
      [FieldId.SharedVpc]: {
        is_allowed: isHypershift === 'false',
        is_selected: false,
        base_dns_domain: '',
        hosted_zone_id: '',
        hosted_zone_role_arn: '',
      },
      [FieldId.ConfigureProxy]: false,
      // Reset VPC settings in case they were configured and then came back to the Control plane step
      [FieldId.MachinePoolsSubnets]: [emptyAWSSubnet()],
      // Uncheck fips selection checkbox when switching Control plane selection
      [FieldId.FipsCryptography]: false,
      // Accounts and roles
      [FieldId.InstallerRoleArn]: NO_ROLE_DETECTED,
      [FieldId.SupportRoleArn]: NO_ROLE_DETECTED,
      [FieldId.WorkerRoleArn]: NO_ROLE_DETECTED,
      ...(isHypershift === 'false' ? { [FieldId.ControlPlaneRoleArn]: NO_ROLE_DETECTED } : {}),
    });
  };

  return (
    <Grid hasGutter>
      <GridItem span={6}>
        <HostedTile
          handleChange={handleChange}
          isHostedDisabled={isHostedDisabled}
          isSelected={value === 'true'}
        />
      </GridItem>
      <GridItem span={6}>
        <StandAloneTile handleChange={handleChange} isSelected={value === 'false'} />
      </GridItem>
      <GridItem span={6}>
        <Content component={ContentVariants.p}>
          <ExternalLink href={links.VIRTUAL_PRIVATE_CLOUD_URL}>
            Learn more about Virtual Private Cloud
          </ExternalLink>
        </Content>
      </GridItem>
    </Grid>
  );
};

const ControlPlaneScreen = () => {
  const { setFieldValue, getFieldProps, setFieldTouched } = useFormState();

  const quotaList = useGlobalState((state) => state.userProfile.organization.quotaList);

  const hasHostedProductQuota = React.useMemo(
    () =>
      availableQuota(quotaList, {
        product: normalizedProducts.ROSA,
        // marketplace_aws is the ROSA HCP billing model
        billingModel: clusterBillingModelToRelatedResource(
          SubscriptionCommonFieldsClusterBillingModel.marketplace_aws,
        ),
        resourceType: QuotaTypes.CLUSTER,
      }) >= 1,
    [quotaList],
  );

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        return false;
      }}
    >
      {/* these images use fixed positioning */}
      <div className="ocm-c-wizard-intro-image-container">
        <img src={RedHat} className="ocm-c-wizard-intro-image-top" aria-hidden="true" alt="" />
        <img src={AWSLogo} className="ocm-c-wizard-intro-image-bottom" aria-hidden="true" alt="" />
      </div>
      <Grid hasGutter className="pf-v6-u-mt-md">
        <GridItem span={10}>
          <WelcomeMessage />
        </GridItem>
        <GridItem span={10}>
          <PrerequisitesInfoBox />
        </GridItem>
        <GridItem span={10}>
          <Title headingLevel="h3" className="pf-v6-u-mb-sm">
            Select the ROSA architecture based on your control plane requirements
          </Title>
          <Stack hasGutter>
            <StackItem>
              <RosaArchitectureRenamingAlert />
            </StackItem>
            <StackItem>
              <Content component={ContentVariants.p}>
                Not sure what to choose?{' '}
                <ExternalLink href={links.AWS_CONTROL_PLANE_URL}>
                  Learn more about control plane architecture
                </ExternalLink>
              </Content>
            </StackItem>
          </Stack>
        </GridItem>
      </Grid>
      <Field
        name={FieldId.Hypershift}
        component={ControlPlaneField}
        validate={(value: hypershiftValue | undefined) =>
          !value ? 'Control plane is required.' : undefined
        }
        input={{
          // name, value, onBlur, onChange
          ...getFieldProps(FieldId.Hypershift),
          onChange: (value: string) => {
            setFieldTouched(FieldId.Hypershift);
            setFieldValue(FieldId.Hypershift, value, false);
          },
        }}
        hasHostedProductQuota={hasHostedProductQuota}
      />
    </Form>
  );
};

export default ControlPlaneScreen;
