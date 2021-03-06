import { render, commit, refresh } from '../effects'
import { call } from 'redux-saga/effects'
import * as t from 'io-ts'
import createRenderer from '../createRenderer'
import * as _ from 'lodash'
import { React, DomNode, DOM } from '../../dom'
import { Map } from 'immutable'
import Node from '../../node'

import loadDoc from './loaders/doc-loader'
import loadStl from './loaders/stl-loader'

import evalParams from './params'

export { DomNode, Node }

const isStl = (moduleId: string): boolean => !_.isNull(moduleId.match(/\.stl$/))

export default createRenderer({
    tagName: 'craftml-module',
    defaultProps: {     
        module: '',
        name: '',    // TODO: must be required
        t: '',
        repeat: '',
        merge: false
    },
    propTypes: t.interface({
        module: t.string,
        name: t.string,
        t: t.string,
        repeat: t.string,
        merge: t.boolean,
    }),
    merge: false,
    getSaga: (node, props, domNode) => function* () {
            
        let part = node.context.getPart(props.name)        

        if (!part) {

            // handles inline part definition
            // <stuff module="bbbb">
            // -->
            // <craftml-module name="stuff" module="bbbb" {...props}/>
            if (props.module) {
        
                part = {
                    type: 'import',
                    props: {},
                    body: props.module,
                }
        
            } else {
        
                return
        
            }
                
        }

        const clientGivenTagName = props.name

        let instanceDef: {
            displayTagName: string,
            children: DomNode[],
            props: typeof props,
            partProps: {
                merge?: boolean
            }
        } | null = null

        if (part.type === 'import') {

            const moduleId = part.body
            // console.log('moduleId', moduleId, isStl(moduleId))

            if (isStl(moduleId)) {

                let children = yield call(loadStl, moduleId)
          
                instanceDef = {
                  displayTagName: `craftml-module@${moduleId}`,
                  children,
                  props,
                  partProps: part.props,
                }
          
            } else {
          
                const children = yield call(loadDoc, moduleId)
          
                instanceDef = {
                  displayTagName: `craftml-module@${moduleId}`,
                  children,
                  props,
                  partProps: part.props,
                }
            }

        } else if (part.type === 'local') {
          
            // TODO: handle merge more gracefully
            let partProps = part.props
            // why??
            // coerce merge='' to merge=true
            // if (_.has(part.body.attribs,'merge')) {
            //     // $FlowFixMe
            //     partProps.merge = true
            // }
        
            instanceDef = {
                displayTagName: `craftml-module@local`,
                children: part.body.children || [],
                props,
                partProps
            }                          

        }

        if (instanceDef) {

            // <part name="foo" merge> -> instanceDef.partProps.merge
            // <foo merge> -> props.merge
            const merge = instanceDef.partProps.merge || props.merge
                
            // render a new top node (without html props)
            const top = DOM(<craftml-group tagName={instanceDef.displayTagName} merge={true}/>)
            yield render(node, top)

            node = yield refresh(node)
            
            const clientGivenProps = domNode.attribs || {} 

            const params = evalParams(node, clientGivenProps, instanceDef.children)

            const paramsMap = Map(params)
            node = node.updateContext(ctx => ctx.setParams(paramsMap))

            const block = {children: domNode.children || [], context: paramsMap}
            node = node.updateContext(ctx => ctx.setBlock(block))
                        
            yield commit(node)            
        
            let wrapped = DOM(
                <g {...instanceDef.props} merge={merge} tagName={clientGivenTagName}>
                    <g {...instanceDef.partProps} merge={true}>
                        {instanceDef.children}
                    </g>
                </g>)
        
            yield render(node.child(0), wrapped)
        }
    }
})