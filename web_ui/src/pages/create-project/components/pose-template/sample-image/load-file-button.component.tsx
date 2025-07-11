// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { FileTrigger, Flex } from '@adobe/react-spectrum';

import { Image } from '../../../../../assets/icons';
import { Button } from '../../../../../shared/components/button/button.component';
import { onValidFileList } from '../../../../../shared/utils';

interface LoadFileButtonProps {
    onFileLoaded: (image: string) => void;
}

export const LoadFileButton = ({ onFileLoaded }: LoadFileButtonProps) => {
    const onProcessUploadFile = onValidFileList(async ([file]: File[]) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            onFileLoaded(String(reader.result));
        };
        reader.readAsDataURL(file);
    });

    return (
        <FileTrigger onSelect={onProcessUploadFile} aria-label='upload sample image'>
            <Button variant={'secondary'} maxWidth={'size-3000'}>
                <Flex gap={'size-75'} alignItems={'center'}>
                    <Image />
                    Upload sample image
                </Flex>
            </Button>
        </FileTrigger>
    );
};
