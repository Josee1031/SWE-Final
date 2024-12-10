// src/components/CatalogueHandler.js

import React from 'react';
import { useUser } from '@/components/src-contexts-user-context';
import UserCataloguePage from '@/components/src-user-catalogue';
import CataloguePage from '@/components/src-components-catalogue-page';

const CatalogueHandler = () => {
    const { user } = useUser();

    if (user.role === 'user') {
        return <UserCataloguePage />;
    } else if (user.role === 'staff') {
        return <CataloguePage />;
    } else {
        // Optional: Handle other roles or redirect
        return <div>Unauthorized Access</div>;
    }
};

export default CatalogueHandler;
