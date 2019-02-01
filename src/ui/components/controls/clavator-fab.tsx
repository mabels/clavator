import * as React from 'react';
import { Fab, withStyles } from '@material-ui/core';
import { FabProps } from '@material-ui/core/Fab';

export const ClavatorFab = withStyles((theme) => ({
    root: {
        position: 'absolute',
        bottom: theme.spacing.unit * 2,
        right: theme.spacing.unit * 2
    }
}))((props: FabProps) => {
    console.log('ClavatorFab', props);
    return <Fab {...props}></Fab>;
});
