// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { useOverlayTriggerState } from '@react-stately/overlays';
import { fireEvent, render, RenderResult, screen } from '@testing-library/react';

import { createInMemoryMediaService } from '../../../../../core/media/services/in-memory-media-service/in-memory-media-service';
import { MediaService } from '../../../../../core/media/services/media-service.interface';
import { DOMAIN } from '../../../../../core/projects/core.interface';
import { ExportFormats } from '../../../../../core/projects/dataset.interface';
import { getMockedProject } from '../../../../../test-utils/mocked-items-factory/mocked-project';
import { RequiredProviders } from '../../../../../test-utils/required-providers-render';
import { MediaProvider } from '../../../../media/providers/media-provider.component';
import { useProject } from '../../../providers/project-provider/project-provider.component';
import { ExportDatasetDialog } from './export-dataset-dialog.component';

jest.mock('../../../providers/project-provider/project-provider.component', () => ({
    ...jest.requireActual('../../../providers/project-provider/project-provider.component'),
    useProject: jest.fn(),
}));

const mockDatasetId = '321';
const mockWorkspaceId = '123';
jest.mock('../../../../annotator/hooks/use-dataset-identifier.hook', () => ({
    ...jest.requireActual('../../../../annotator/hooks/use-dataset-identifier.hook'),
    useDatasetIdentifier: () => ({ workspaceId: mockWorkspaceId, datasetId: mockDatasetId }),
}));

const mockAddNotification = jest.fn();
jest.mock('../../../../../notification/notification.component', () => ({
    ...jest.requireActual('../../../../../notification/notification.component'),
    useNotification: () => ({ addNotification: mockAddNotification }),
}));

const mockPrepareExportDataset = jest.fn();
jest.mock('../../../hooks/use-export-dataset.hook', () => ({
    ...jest.requireActual('../../../hooks/use-export-dataset.hook'),
    useExportDataset: () => ({
        prepareExportDatasetJob: {
            mutate: mockPrepareExportDataset,
            isLoading: false,
        },
    }),
}));

const queryRadioOption = (format: ExportFormats) => screen.queryByRole('radio', { name: format });

describe('ExportDatasetDialog', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderApp = async ({
        domains,
        isTaskChainProject = false,
        mediaService = createInMemoryMediaService(),
    }: {
        domains: DOMAIN[];
        isTaskChainProject?: boolean;
        mediaService?: MediaService;
    }): Promise<RenderResult> => {
        jest.mocked(useProject).mockReturnValue({
            ...jest.requireActual('../../../providers/project-provider/project-provider.component'),
            project: getMockedProject({ domains }),
            isTaskChainProject,
        });

        const App = () => {
            const exportDialogState = useOverlayTriggerState({});

            return (
                <>
                    <button onClick={() => exportDialogState.open()}>open dialog</button>
                    <Provider theme={defaultTheme}>
                        <RequiredProviders mediaService={mediaService}>
                            <MediaProvider>
                                <ExportDatasetDialog triggerState={exportDialogState} datasetName='testDatasetName' />
                            </MediaProvider>
                        </RequiredProviders>
                    </Provider>
                </>
            );
        };

        const component = await render(<App />);

        fireEvent.click(screen.getByText('open dialog'));

        return component;
    };

    it('call onAction upon clicking Export', async () => {
        await renderApp({ domains: [DOMAIN.DETECTION] });

        expect(screen.queryByRole('dialog')).toBeInTheDocument();
        expect(screen.queryByText(ExportFormats.VOC.toUpperCase())).toBeInTheDocument();

        fireEvent.click(screen.getByText(ExportFormats.VOC.toUpperCase()));
        fireEvent.click(screen.getByRole('button', { name: 'Export' }));

        expect(mockPrepareExportDataset).toHaveBeenCalledWith(
            expect.objectContaining({
                datasetId: mockDatasetId,
                workspaceId: mockWorkspaceId,
                exportFormat: ExportFormats.VOC,
            }),
            expect.anything()
        );
    });

    it('close upon clicking Cancel', async () => {
        await renderApp({ domains: [DOMAIN.DETECTION] });
        expect(screen.queryByRole('dialog')).toBeInTheDocument();
        fireEvent.click(screen.getByText(ExportFormats.COCO.toUpperCase()));
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    describe('render export options', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('detection bounding box', async () => {
            await renderApp({ domains: [DOMAIN.DETECTION] });
            expect(queryRadioOption(ExportFormats.VOC)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.COCO)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.YOLO)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();
        });

        it('detection oriented', async () => {
            await renderApp({ domains: [DOMAIN.DETECTION_ROTATED_BOUNDING_BOX] });
            expect(queryRadioOption(ExportFormats.VOC)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.COCO)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.YOLO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();
        });

        it('segmentation semantic', async () => {
            await renderApp({ domains: [DOMAIN.SEGMENTATION] });
            expect(queryRadioOption(ExportFormats.VOC)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.COCO)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.YOLO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();
        });

        it('segmentation instance', async () => {
            await renderApp({ domains: [DOMAIN.SEGMENTATION_INSTANCE] });
            expect(queryRadioOption(ExportFormats.VOC)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.COCO)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.YOLO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();
        });

        it('classification', async () => {
            await renderApp({ domains: [DOMAIN.CLASSIFICATION] });
            expect(queryRadioOption(ExportFormats.VOC)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.COCO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.YOLO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();
        });

        it('anomaly classification', async () => {
            await renderApp({ domains: [DOMAIN.ANOMALY_CLASSIFICATION] });
            expect(queryRadioOption(ExportFormats.VOC)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.COCO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.YOLO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();
        });

        it('anomaly detection', async () => {
            await renderApp({ domains: [DOMAIN.ANOMALY_DETECTION] });
            expect(queryRadioOption(ExportFormats.VOC)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.COCO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.YOLO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();
        });

        it('anomaly segmentation', async () => {
            await renderApp({ domains: [DOMAIN.ANOMALY_SEGMENTATION] });
            expect(queryRadioOption(ExportFormats.VOC)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.COCO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.YOLO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();
        });

        it('detection classification', async () => {
            await renderApp({ domains: [DOMAIN.DETECTION, DOMAIN.CROP, DOMAIN.CLASSIFICATION] });
            expect(queryRadioOption(ExportFormats.VOC)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.COCO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.YOLO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();
        });

        it('detection segmentation', async () => {
            await renderApp({ domains: [DOMAIN.DETECTION, DOMAIN.CROP, DOMAIN.SEGMENTATION] });
            expect(queryRadioOption(ExportFormats.VOC)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.COCO)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.YOLO)).not.toBeInTheDocument();
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();
        });

        it.each([
            DOMAIN.CLASSIFICATION,
            DOMAIN.DETECTION,
            DOMAIN.DETECTION_ROTATED_BOUNDING_BOX,
            DOMAIN.SEGMENTATION,
            DOMAIN.ANOMALY_CLASSIFICATION,
            DOMAIN.ANOMALY_DETECTION,
            DOMAIN.ANOMALY_SEGMENTATION,
            DOMAIN.SEGMENTATION_INSTANCE,
        ])('should render Datumaro export option when project domain is "%s"', async (domain) => {
            await renderApp({ domains: [domain] });
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeVisible();
        });

        it('should render Datumaro export option for task chain projects', async () => {
            await renderApp({ domains: [DOMAIN.DETECTION], isTaskChainProject: true });

            expect(queryRadioOption(ExportFormats.VOC)).toBeVisible();
            expect(queryRadioOption(ExportFormats.COCO)).toBeVisible();
            expect(queryRadioOption(ExportFormats.YOLO)).toBeVisible();

            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();
        });

        it('disables all formats except datumaro when using native video export', async () => {
            await renderApp({ domains: [DOMAIN.DETECTION], isTaskChainProject: true });

            // Confirm that our default dataset contains videos
            expect(await screen.findByText('2 frames', { exact: false })).toBeVisible();

            expect(queryRadioOption(ExportFormats.VOC)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.COCO)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.YOLO)).toBeEnabled();
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();

            fireEvent.click(screen.getByRole('radio', { name: `Keep the native video format` }));

            expect(queryRadioOption(ExportFormats.VOC)).toBeDisabled();
            expect(queryRadioOption(ExportFormats.COCO)).toBeDisabled();
            expect(queryRadioOption(ExportFormats.YOLO)).toBeDisabled();
            expect(queryRadioOption(ExportFormats.DATUMARO)).toBeEnabled();
        });
    });

    it('dataset does not have videos, radio option is hidden', async () => {
        await renderApp({ domains: [DOMAIN.DETECTION] });

        expect(screen.queryByText('Choose how to export videos')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText(ExportFormats.VOC.toUpperCase()));
        fireEvent.click(screen.getByRole('button', { name: 'Export' }));

        expect(mockPrepareExportDataset).toHaveBeenCalledWith(
            expect.objectContaining({ saveVideoAsImages: true }),
            expect.anything()
        );
    });
});
