import './NotebookScene.scss'

import { IconClock, IconDownload, IconEllipsis, IconShare, IconTrash } from '@posthog/icons'
import { LemonButton } from '@posthog/lemon-ui'
import { useActions, useValues } from 'kea'
import { router } from 'kea-router'
import { LemonMenu } from 'lib/lemon-ui/LemonMenu'
import { urls } from 'scenes/urls'

import { notebooksModel } from '~/models/notebooksModel'

import { notebookLogic, NotebookLogicProps } from './Notebook/notebookLogic'
import { accessLevelSatisfied } from 'lib/components/AccessControlAction'
import { AccessControlResourceType } from '~/types'

export function NotebookMenu({ shortId }: NotebookLogicProps): JSX.Element {
    const { notebook, showHistory, isLocalOnly } = useValues(notebookLogic({ shortId }))
    const { openShareModal } = useActions(notebookLogic({ shortId }))
    const { exportJSON, setShowHistory } = useActions(notebookLogic({ shortId }))

    return (
        <LemonMenu
            items={[
                {
                    label: 'Export JSON',
                    icon: <IconDownload />,
                    onClick: () => exportJSON(),
                },
                {
                    label: 'History',
                    icon: <IconClock />,
                    onClick: () => setShowHistory(!showHistory),
                },
                {
                    label: 'Share',
                    icon: <IconShare />,
                    onClick: () => openShareModal(),
                },
                !isLocalOnly &&
                    !notebook?.is_template && {
                        label: 'Delete',
                        icon: <IconTrash />,
                        status: 'danger',
                        disabledReason:
                            !notebook?.user_access_level ||
                            !accessLevelSatisfied(
                                AccessControlResourceType.Notebook,
                                notebook.user_access_level,
                                'editor'
                            )
                                ? 'You do not have permission to delete this notebook.'
                                : undefined,
                        onClick: () => {
                            notebooksModel.actions.deleteNotebook(shortId, notebook?.title)
                            router.actions.push(urls.notebooks())
                        },
                    },
            ]}
        >
            <LemonButton aria-label="more" icon={<IconEllipsis />} size="small" />
        </LemonMenu>
    )
}
