'use client';
import { memo, useCallback, useState } from 'react';
import { Input, Box, HStack, VStack } from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateChunkSizeMutation, setError, validateChunkSizeField, setFieldError, validateChunkSizeForm, setFormErrors } from '@/redux/slices/adminSlice';
import { FieldRoot } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
interface FormData {
  chunkSize: number;
  overlapSize: number;
}
const InputField = memo(({ label, value, onChange, error, name }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string; name: 'chunkSize' | 'overlapSize' }) => (
  <FieldRoot required invalid={Boolean(error)} errorText={error} label={label}>
    <Input type="number" name={name} value={value || ''} onChange={onChange} borderRadius={8} placeholder={`Enter ${label}`} min={0} />
  </FieldRoot>
));
InputField.displayName = 'InputField';
const UpdateChunkSizeForm: React.FC = () => {
  const { userId } = useAuth();
  const dispatch = useDispatch();
  const [updateChunkSize, { isLoading }] = useUpdateChunkSizeMutation();
  const formErrors = useSelector((state: RootState) => state.admin.formErrors);
  const [formData, setFormData] = useState<FormData>({
    chunkSize: 0,
    overlapSize: 0,
  });
  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const numValue = Number(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
      const error = validateChunkSizeField(name as keyof FormData, numValue);
      dispatch(setFieldError({ field: name as keyof FormData, error }));
    },
    [dispatch],
  );
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validateChunkSizeForm(formData);
      dispatch(setFormErrors(validationErrors));
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
      try {
        const response = await updateChunkSize({
          ...formData,
          userId: userId || '',
        }).unwrap();
        toaster.create({
          title: 'Chunk Size Updated',
          description: response.message,
          type: 'success',
        });
      } catch (error) {
        toaster.create({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          type: 'error',
        });
      }
    },
    [formData, userId, updateChunkSize, dispatch],
  );
  return (
    <Box w="100%">
      <form onSubmit={handleSubmit} noValidate>
        <VStack gap={4} alignItems="flex-start">
          <HStack gap={4} w="100%">
            <FieldRoot required invalid={!!formErrors.chunkSize} errorText={formErrors.chunkSize} label="Chunk Size">
              <Input type="number" value={formData.chunkSize} onChange={handleFieldChange} borderRadius={8} placeholder="Enter Chunk Size" name="chunkSize" />
            </FieldRoot>
            <FieldRoot required invalid={!!formErrors.overlapSize} errorText={formErrors.overlapSize} label="Overlap Size">
              <Input type="number" value={formData.overlapSize} onChange={handleFieldChange} borderRadius={8} placeholder="Enter Overlap Size" name="overlapSize" />
            </FieldRoot>
          </HStack>
          <Button fontWeight="normal" fontSize="sm" maxW="200px" minH="50px" loading={isLoading} loadingText="Updating" type="submit" width="full" borderRadius={8}>
            Update Chunk Size
          </Button>
        </VStack>
      </form>
    </Box>
  );
};
export default memo(UpdateChunkSizeForm);
