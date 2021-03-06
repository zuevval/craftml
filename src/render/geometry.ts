import { Geometry } from 'three';
import { commit } from './effects'
import * as t from 'io-ts'
import createRenderer from './createRenderer'
import { DomNode } from '../dom'
import Node from '../node'
export { DomNode, Node }

export default createRenderer({
    tagName: 'craftml-geometry',
    defaultProps: {
        geometry: {},
        dimensions: 3
    },
    propTypes: t.interface({
        geometry: t.object,   
        dimensions: t.number  
    }),
    merge: false,
    getSaga: (node, props, domNode) => function* () {
            
        const { geometry, dimensions } = props 
        
        node = node.updateShape(s => s.setGeometry(geometry as Geometry).setDimensions(dimensions))

        yield commit(node)
        
    }
})