import { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Container, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StepCreateAssociation } from './StepCreateAssociation';
import { StepAddMembers } from './StepAddMembers';
import { StepWelcome } from './StepWelcome';

export const OnboardingWizard = () => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [associationId, setAssociationId] = useState<string | null>(null);

  const steps = [
    t('onboarding.step1.title'),
    t('onboarding.step2.title'),
    t('onboarding.step3.title'),
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAssociationCreated = (id: string) => {
    setAssociationId(id);
    handleNext();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <StepCreateAssociation
            onNext={handleAssociationCreated}
          />
        );
      case 1:
        return (
          <StepAddMembers
            associationId={associationId!}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleNext}
          />
        );
      case 2:
        return (
          <StepWelcome
            associationId={associationId!}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ mt: 4 }}>
            {renderStepContent(activeStep)}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
