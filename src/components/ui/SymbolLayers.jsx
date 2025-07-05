import React from 'react'
import SymbolLayer from './SymbolLayer'
import { FaCode, FaDollarSign, FaPercent, FaPlus } from 'react-icons/fa6'
import { FiTriangle } from "react-icons/fi";

const SymbolLayers = () => {
    return (
        <div className='layers-container'>
            <SymbolLayer depth={40 * 2} symbolSize={30} symbolCount={25} symbol={<FaCode />}/>
            <SymbolLayer depth={25 * 2} symbolSize={20} symbolCount={25} symbol={<FaDollarSign />}/>
            <SymbolLayer depth={10 * 2} symbolSize={15} symbolCount={25} symbol={<FiTriangle/>}/>
        </div>
    )
}

export default SymbolLayers