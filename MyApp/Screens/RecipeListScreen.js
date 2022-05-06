import React, { useState, useEffect } from "react";

import RecipeList from "../Components/Recipe/RecipeList";
import SubuserBanner from "../Components/SubuserBanner";

function RecipeListScreen({ navigation }) {
    return (
        <>
            <SubuserBanner/>
            <RecipeList navigation={navigation}/>
        </>
    );
};


export default RecipeListScreen