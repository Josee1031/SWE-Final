// src/components/CatalogueHandler.js

import { useUser } from '@/components/src-contexts-user-context';
import UserCataloguePage from '@/components/src-user-catalogue';
import CataloguePage from '@/components/src-components-catalogue-page';

const CatalogueHandler = () => {
    const { user } = useUser();

    if (!user) {
        return <div>Loading...</div>;
    }

    return user.is_staff ? <CataloguePage /> : <UserCataloguePage />;
};

export default CatalogueHandler;
