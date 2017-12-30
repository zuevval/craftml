import { React, DomNode, DOM } from '../../dom'
import { render } from '../effects'
import Node from '../../node'
import * as _ from 'lodash'
// import makeRenderSagaCreator from '../makeRenderSagaCreator'
import { Geometry } from 'three'

import * as iots from 'io-ts'
import { PathReporter, } from 'io-ts/lib/PathReporter'

// type PrimitiveDefinition<T> = {
//     tagName: string,
//     propTypes: {},
//     defaultProps: T,
//     getGeometry: (props: T) => Geometry | Geometry[],
//     dimensions: number
// }

// type PropTypes = iots.InterfaceType<iots.Props, iots.Any>

type PropTypes = iots.InterfaceType<{}, {}>

type PrimitiveDefinition<T extends PropTypes> = {
    tagName: string,
    propTypes: T,
    defaultProps: iots.TypeOf<T>,
    getGeometry: (props: iots.TypeOf<T>) => Geometry | Geometry[],
    dimensions: number
}

function wrap_t(component: DomNode, t: string): DomNode {
    return DOM(<craftml-transform t={t}>{component}</craftml-transform>)
}

function wrap_repeat(component: DomNode, props: { repeat: number | string }) {

    // const { n = 1 } = props
    // if (typeof props.repeat === 'number')

    const n = props.repeat
    // $FlowFixMe
    return <craftml-repeat n={n}>{component}</craftml-repeat>
}

import createRenderer, { } from '../createRenderer'

export default function createPrimitive<T extends PropTypes>(def: PrimitiveDefinition<T>) {

    const getSaga = (node: Node, props: iots.TypeOf<T> & { t: string }, domNode: DomNode) => function* () {

        const geometryProps = props
        
        const geometry = def.getGeometry(geometryProps)
    
        const dimensions = def.dimensions        
        
        let wrapped: DomNode
        
        if (Array.isArray(geometry)) {
            wrapped = DOM(
                <craftml-group merge={false}>
                    {_.map(geometry, g => <craftml-geometry geometry={g} dimensions={dimensions} />)}
                </craftml-group>
            )
        } else {
            wrapped = DOM(<craftml-geometry geometry={geometry} dimensions={dimensions} />)
        }

        wrapped = wrap_t(wrapped, props.t)

        wrapped = DOM(
            <craftml-group tagName={def.tagName} merge={false}>
                {wrapped}
            </craftml-group>)
        
        // const PrimitiveProps = iots.interface(def.propTypes)
        const validation = iots.validate(props, def.propTypes)
        if (validation.isLeft()) {
            // TODO: report error
            // example: https://github.com/OliverJAsh/io-ts-reporters/blob/master/src/index.ts
            console.error(PathReporter.report(validation))
        }
    
        // wrapped = wrap_repeat(wrapped, props)
    
        // console.log('wrapped', wrapped)
    
        // yield call(render(nodux.child(0), DOM(wrapped)))
    
        yield render(node, wrapped)
    }

    return createRenderer({
        tagName: def.tagName,
        propTypes: def.propTypes,
        defaultProps: def.defaultProps,
        merge: false,
        getSaga,
        // getSaga1: (node, props, domNode) => function* () {

        //     const geometryProps = props
            
        //     const geometry = def.getGeometry(geometryProps)
        
        //     const dimensions = def.dimensions        
            
        //     let wrapped: DomNode
            
        //     if (Array.isArray(geometry)) {
        //         wrapped = DOM(
        //             <craftml-group merge={false}>
        //                 {_.map(geometry, g => <craftml-geometry geometry={g} dimensions={dimensions} />)}
        //             </craftml-group>
        //         )
        //     } else {
        //         wrapped = DOM(<craftml-geometry geometry={geometry} dimensions={dimensions} />)
        //     }


        //     wrapped = wrap_t(wrapped, props.t)

        //     wrapped = DOM(
        //         <craftml-group tagName={def.tagName} merge={false}>
        //             {wrapped}
        //         </craftml-group>)
        
        
        
        //     // const PrimitiveProps = iots.interface(def.propTypes)
        //     const validation = iots.validate(props, def.propTypes)
        //     if (validation.isLeft()) {
        //         // TODO: report error
        //         // example: https://github.com/OliverJAsh/io-ts-reporters/blob/master/src/index.ts
        //         console.error(PathReporter.report(validation))
        //     }
        
        //     // wrapped = wrap_repeat(wrapped, props)
        
        //     // console.log('wrapped', wrapped)
        
        //     // yield call(render(nodux.child(0), DOM(wrapped)))
        
        //     yield render(node, wrapped)

        // }
    })

}

// function resolveProps(propTypes: PropTypes, props: {}, defaultProps: {}) {

//     const resolvedProps = _.defaults(props, defaultProps)
//     // console.log('propTypes', propTypes)
//     _.map(propTypes.props, (propValue, propName) => {

//         // type conversion
//         if (propValue === iots.number) {

//             resolvedProps[propName] = Number(props[propName])
//         }

//     })

//     // console.log('resolvedProps', resolvedProps)
//     return resolvedProps
// }

// function* renderPrimitive<T extends PropTypes>
//     (def: PrimitiveDefinition<T>, node: Node, props: T, domNode: DomNode) {

//     const geometryProps = props

//     const geometry = def.getGeometry(geometryProps)

//     const dimensions = def.dimensions

//     let wrapped: DomNode

//     if (Array.isArray(geometry)) {
//         wrapped = DOM(
//             <craftml-group merge={false}>
//                 {_.map(geometry, g => <craftml-geometry geometry={g} dimensions={dimensions} />)}
//             </craftml-group>
//         )
//     } else {
//         wrapped = DOM(<craftml-geometry geometry={geometry} dimensions={dimensions} />)
//     }

//     // const htmlProps = _.pick(props, ['id','class','style','merge'])

//     wrapped = wrap_t(wrapped, props.t)

//     // wrapped = <craftml_group tagName={def.tagName} {...htmlProps}>
//     //   { wrapped }
//     // </craftml_group>

//     wrapped = DOM(
//         <craftml-group tagName={def.tagName} merge={false}>
//             {wrapped}
//         </craftml-group>)



//     // const PrimitiveProps = iots.interface(def.propTypes)
//     const validation = iots.validate(props, def.propTypes)
//     if (validation.isLeft()) {
//         // TODO: report error
//         // example: https://github.com/OliverJAsh/io-ts-reporters/blob/master/src/index.ts
//         console.error(PathReporter.report(validation))
//     }

//     // wrapped = wrap_repeat(wrapped, props)

//     // console.log('wrapped', wrapped)

//     // yield call(render(nodux.child(0), DOM(wrapped)))

//     yield render(node, wrapped)

//     // yield call(render(nodux, DOM(wrapped)))

// }