import Modal from '../../../components/Modal';
import Create from '../create';

type EditingProps = {
    show: boolean;
    close: () => void;
    dataID?: string;
}


export default ({ show, close, dataID }: EditingProps) => {
    return (
        <Modal
            maxWidth={1200}
            maxHeight={800}
            isOpen={show}
            onClose={() => close()}
            spaceless={true}
            noXmark={true}
            bodyContent={<Create dataID={dataID} />}>
        </Modal >
    )
}