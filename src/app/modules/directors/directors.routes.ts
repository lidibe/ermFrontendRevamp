import { Routes } from '@angular/router';
import {DirectorComponent} from "./directors.component";
import {DirectorsListComponent} from "./list/list.component";
import {DirectorsDetailsComponent} from "./details/details.component";
import {CanDeactivateDirectorsDetails} from "./directors.guards";
import {
    DirectorsClassesResolver,
    DirectorsCountriesResolver,
    DirectorsDirectorResolver,
    DirectorsDirectorsResolver, DirectorsLanguagesResolver, DirectorsStatusResolver, DirectorsTitlesResolver, DirectorsTypesResolver
} from "./directors.resolvers";
import { DirectorsTrailsComponent } from './trails/trails.component';


export default [
    {
        path     : '',
        component: DirectorComponent,
        resolve  : {
        },
        children : [
            {
                path     : '',
                component: DirectorsListComponent,
                resolve  : {
                    classes  : DirectorsClassesResolver,
                    countries: DirectorsCountriesResolver
                },
                children : [
                    {
                        path         : ':id',
                        component    : DirectorsDetailsComponent,
                        resolve      : {
                            classes   : DirectorsClassesResolver,
                            countries : DirectorsCountriesResolver,
                            director  : DirectorsDirectorResolver,
                            directors : DirectorsDirectorsResolver,
                            languages : DirectorsLanguagesResolver,
                            titles    : DirectorsTitlesResolver,
                            types     : DirectorsTypesResolver,
                            status     : DirectorsStatusResolver,
                        },
                        canDeactivate: [CanDeactivateDirectorsDetails]
                    },
                    {
                        path         : ':code/trails',
                        component    : DirectorsTrailsComponent,
                    },
                ]
            }
        ]
    }
] as Routes;
