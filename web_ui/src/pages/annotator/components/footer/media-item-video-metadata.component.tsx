// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { useMediaQuery } from '@react-spectrum/utils';

import { isVideoFrame, Video, VideoFrame } from '../../../../core/media/video.interface';
import { isLargeSizeQuery } from '../../../../theme/queries';
import { FPS } from './fps.component';
import { FrameNumber } from './frame-number.component';
import { LastAnnotator } from './last-annotator.component';
import { MediaNameAndResolution } from './media-name-and-resolution.component';

import classes from './annotator-footer.module.scss';

export const MediaItemVideoMetadata = ({ mediaItem }: { mediaItem: Video | VideoFrame }): JSX.Element => {
    const { width, height } = mediaItem.metadata;
    const isLargeSize = useMediaQuery(isLargeSizeQuery);

    return (
        <>
            {mediaItem.lastAnnotatorId && (
                <LastAnnotator isLargeSize={isLargeSize} lastAnnotatorId={mediaItem.lastAnnotatorId} />
            )}
            <MediaNameAndResolution isLargeSize={isLargeSize} width={width} height={height} name={mediaItem.name} />

            <FPS mediaItem={mediaItem} className={classes.metaItem} />
            {isVideoFrame(mediaItem) && <FrameNumber mediaItem={mediaItem} className={classes.frameNumber} />}
        </>
    );
};
