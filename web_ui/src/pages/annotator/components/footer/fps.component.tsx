// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { useNumberFormatter, View } from '@adobe/react-spectrum';
import { dimensionValue, useMediaQuery } from '@react-spectrum/utils';

import { Fps } from '../../../../assets/icons';
import { Video, VideoFrame } from '../../../../core/media/video.interface';
import { biggerThanQuery } from '../../../../theme/queries';

export const FPS = ({ mediaItem, className }: { mediaItem: Video | VideoFrame; className?: string }): JSX.Element => {
    const formatter = useNumberFormatter({
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const isBiggerThan1020px = useMediaQuery(biggerThanQuery('1020'));

    if (isNaN(mediaItem.metadata.fps)) {
        return <></>;
    }

    return (
        <View height='100%' paddingX={'size-100'} UNSAFE_className={className}>
            {isBiggerThan1020px && <Fps />}
            <span style={{ fontSize: dimensionValue('size-130') }} id='video-fps' aria-label='fps'>
                {formatter.format(mediaItem.metadata.fps)} fps
            </span>
        </View>
    );
};
