"use client"

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import React, { useState, useEffect, useCallback } from 'react'

interface Currency {
    symbol: string;
    name: string;
}

interface Calculations {
    monthlyPersonnelCost: number;
    monthlyInfrastructureCost: number;
    monthlyOperationalCost: number;
    totalMonthlyCost: number;
    droneTotalCost: number;
    droneCostPerKm: number;
    batteryCostPerCycle: number;
    costPerFlight: number;
    totalCostPerFlight: number;
    revenuePerFlight: number;
    breakEvenPoint: string | number; // Break-even can be 'N/A' string or a number
    whatIfData: WhatIfDataPoint[];
}

interface WhatIfDataPoint {
    dailyFlights: number;
    monthlyFlights: number;
    costPerFlight: number;
    revenuePerFlight: number;
    costs: number;
    revenue: number;
    profitLoss: number;
    profitLossPerFlight: number;
}

interface HubInputs {
    hubNodeInfrastructureCost: string;
    numberOfNodes: string;
    hubInfrastructureLife: string;
    totalPersonnelCount: string;
    averagePersonnelCost: string;
    insuranceCostPerDrone: string;
    numberOfDrones: string;
    softwareCosts: string;
    totalUtilities: string;
    hubRent: string;
}

interface DroneInputs {
    frameCost: string;
    propulsionCost: string;
    electronicsCost: string;
    wiringCost: string;
    maintenanceCostLife: string;
    droneLifeKm: string;
    droneRange: string;
}

interface BatteryInputs {
    batteryCost: string;
    batteryLifeCycles: string;
}

interface OperationalInputs {
    revenuePerFlight: string;
    percentageOverCost: string;
    workingDaysPerMonth: string;
    usePercentage: boolean;
}

const currencies: { [key: string]: Currency } = {
    INR: { symbol: '₹', name: 'Indian Rupee' },
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' }
};

function RedwingDroneCalculatorComponent() {
    const [selectedCurrency, setSelectedCurrency] = useState<string>('INR')

    // Hub Calculator State
    const [hubInputs, setHubInputs] = useState<HubInputs>({
        hubNodeInfrastructureCost: '0',
        numberOfNodes: '0',
        hubInfrastructureLife: '0',
        totalPersonnelCount: '0',
        averagePersonnelCost: '0',
        insuranceCostPerDrone: '0',
        numberOfDrones: '0',
        softwareCosts: '0',
        totalUtilities: '0',
        hubRent: '0',
    })

    // Drone Calculator State
    const [droneInputs, setDroneInputs] = useState<DroneInputs>({
        frameCost: '0',
        propulsionCost: '0',
        electronicsCost: '0',
        wiringCost: '0',
        maintenanceCostLife: '0',
        droneLifeKm: '0',
        droneRange: '0',
    })

    // Battery Calculator State
    const [batteryInputs, setBatteryInputs] = useState<BatteryInputs>({
        batteryCost: '0',
        batteryLifeCycles: '0',
    })

    // Operational Inputs State
    const [operationalInputs, setOperationalInputs] = useState<OperationalInputs>({
        revenuePerFlight: '0',
        percentageOverCost: '0',
        workingDaysPerMonth: '0',
        usePercentage: true,
    })

    const [calculations, setCalculations] = useState<Calculations>({
        monthlyPersonnelCost: 0,
        monthlyInfrastructureCost: 0,
        monthlyOperationalCost: 0,
        totalMonthlyCost: 0,
        droneTotalCost: 0,
        droneCostPerKm: 0,
        batteryCostPerCycle: 0,
        costPerFlight: 0,
        totalCostPerFlight: 0,
        revenuePerFlight: 0,
        breakEvenPoint: 0,
        whatIfData: [],
    })


    const calculateCosts = useCallback(() => {
        // Hub calculations
        const monthlyPersonnelCost = Number(hubInputs.totalPersonnelCount) * Number(hubInputs.averagePersonnelCost)
        const monthlyInfrastructureCost = Number(hubInputs.hubInfrastructureLife) ?
            Number(hubInputs.hubNodeInfrastructureCost) / Number(hubInputs.hubInfrastructureLife) : 0
        const totalInsuranceCost = Number(hubInputs.insuranceCostPerDrone) * Number(hubInputs.numberOfDrones)
        const monthlyOperationalCost = Number(hubInputs.hubRent) +
            Number(hubInputs.totalUtilities) +
            Number(hubInputs.softwareCosts) +
            totalInsuranceCost
        const totalMonthlyCost = monthlyPersonnelCost + monthlyInfrastructureCost + monthlyOperationalCost

        // Drone calculations
        const droneTotalCost = Number(droneInputs.frameCost) +
            Number(droneInputs.propulsionCost) +
            Number(droneInputs.electronicsCost) +
            Number(droneInputs.wiringCost) +
            Number(droneInputs.maintenanceCostLife)

        const droneCostPerKm = Number(droneInputs.droneLifeKm) ?
            droneTotalCost / Number(droneInputs.droneLifeKm) : 0

        const costPerFlight = droneCostPerKm * Number(droneInputs.droneRange)

        // Battery calculations
        const batteryCostPerCycle = Number(batteryInputs.batteryLifeCycles) ?
            Number(batteryInputs.batteryCost) / Number(batteryInputs.batteryLifeCycles) : 0

        // Total cost per flight calculation
        const totalCostPerFlight = costPerFlight + batteryCostPerCycle

        // Calculate base revenue per flight
        const calculateRevenuePerFlight = (costPerFlight: number) => {
            if (operationalInputs.usePercentage) {
                return costPerFlight * (1 + (Number(operationalInputs.percentageOverCost) / 100)) // Converted here too
            }
            return Number(operationalInputs.revenuePerFlight)
        }

        // What-If Analysis
        const whatIfData: WhatIfDataPoint[] = []; // Explicitly type whatIfData array
        for (let dailyFlights = 0; dailyFlights <= 500; dailyFlights += 5) {
            const monthlyFlights = dailyFlights * Number(operationalInputs.workingDaysPerMonth);
            const variableCostsPerMonth = monthlyFlights * totalCostPerFlight;
            const monthlyCosts = variableCostsPerMonth + totalMonthlyCost;
            const costPerFlightCalc = monthlyFlights > 0 ? monthlyCosts / monthlyFlights : totalCostPerFlight;
            const revenuePerFlightCalc = calculateRevenuePerFlight(costPerFlightCalc);
            const monthlyRevenue = monthlyFlights * revenuePerFlightCalc;
            const profitLoss = monthlyRevenue - monthlyCosts;
            const profitLossPerFlight = revenuePerFlightCalc - costPerFlightCalc;

            whatIfData.push({
                dailyFlights,
                monthlyFlights,
                costPerFlight: Math.round(costPerFlightCalc * 100) / 100,
                revenuePerFlight: Math.round(revenuePerFlightCalc * 100) / 100,
                costs: Math.round(monthlyCosts * 100) / 100,
                revenue: Math.round(monthlyRevenue * 100) / 100,
                profitLoss: Math.round(profitLoss * 100) / 100,
                profitLossPerFlight: Math.round(profitLossPerFlight * 100) / 100
            });
        }

        const breakEvenPoint = whatIfData.find(point => point.profitLoss >= 0)?.dailyFlights || 'N/A';

        setCalculations({
            monthlyPersonnelCost,
            monthlyInfrastructureCost,
            monthlyOperationalCost,
            totalMonthlyCost,
            droneTotalCost,
            droneCostPerKm,
            batteryCostPerCycle,
            costPerFlight,
            totalCostPerFlight,
            revenuePerFlight: calculateRevenuePerFlight(totalCostPerFlight),
            breakEvenPoint,
            whatIfData,
        })
    }, [hubInputs, droneInputs, batteryInputs, operationalInputs]) 

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      calculateCosts()
    }, [calculateCosts]) // Add here

    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined) return `${currencies[selectedCurrency as keyof typeof currencies].symbol}0.00`;
        return `${currencies[selectedCurrency as keyof typeof currencies].symbol}${amount?.toFixed(2) || '0.00'}`; // Added null check for amount
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-8">
            <h1 className="text-4xl font-bold text-center mb-10 text-white">Redwing Drone Cost Calculator</h1>
            {/* ... (Rest of your calculator UI code from the original script) ... */}
            <div className="flex flex-col gap-8 max-w-[1400px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Hub Infrastructure Costs */}
                    <Card className="w-full lg:w-1/2 bg-[#0f1115] border-[#1f2937] text-white">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Hub Infrastructure Costs</h2>
                                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                                    <SelectTrigger className="w-[180px] bg-[#1f2937] border-0">
                                        <SelectValue placeholder="Select Currency" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1f2937] border-[#374151]">
                                        {Object.entries(currencies).map(([code, { name }]) => (
                                            <SelectItem key={code} value={code} className="text-white hover:bg-[#374151]">
                                                {code} - {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-6">
                                {/* Infrastructure Setup */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-4">Infrastructure Setup</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-400">Hub & Node Infrastructure Cost ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={hubInputs.hubNodeInfrastructureCost}
                                                onChange={(e) => setHubInputs(prev => ({ ...prev, hubNodeInfrastructureCost: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Number of Nodes</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={hubInputs.numberOfNodes}
                                                onChange={(e) => setHubInputs(prev => ({ ...prev, numberOfNodes: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Infrastructure Life (Months)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={hubInputs.hubInfrastructureLife}
                                                onChange={(e) => setHubInputs(prev => ({ ...prev, hubInfrastructureLife: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Insurance Cost per Drone/Month ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={hubInputs.insuranceCostPerDrone}
                                                onChange={(e) => setHubInputs(prev => ({ ...prev, insuranceCostPerDrone: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Number of Drones</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={hubInputs.numberOfDrones}
                                                onChange={(e) => setHubInputs(prev => ({ ...prev, numberOfDrones: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Personnel */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-4">Personnel</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-400">Total Personnel Count</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={hubInputs.totalPersonnelCount}
                                                onChange={(e) => setHubInputs(prev => ({ ...prev, totalPersonnelCount: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Average Personnel Cost/Month ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={hubInputs.averagePersonnelCost}
                                                onChange={(e) => setHubInputs(prev => ({ ...prev, averagePersonnelCost: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Monthly Operating Costs */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-4">Monthly Operating Costs</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-400">Software Costs ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={hubInputs.softwareCosts}
                                                onChange={(e) => setHubInputs(prev => ({ ...prev, softwareCosts: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Total Utilities ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={hubInputs.totalUtilities}
                                                onChange={(e) => setHubInputs(prev => ({ ...prev, totalUtilities: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Hub Rent ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={hubInputs.hubRent}
                                                onChange={(e) => setHubInputs(prev => ({ ...prev, hubRent: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Results */}
                                <div className="mt-6 p-4 bg-[#1f2937] rounded-lg grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-gray-400">Monthly Personnel Cost</Label>
                                        <p className="text-xl font-semibold mt-1">{formatCurrency(calculations.monthlyPersonnelCost)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-400">Monthly Infrastructure Cost</Label>
                                        <p className="text-xl font-semibold mt-1">{formatCurrency(calculations.monthlyInfrastructureCost)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-400">Monthly Operational Cost</Label>
                                        <p className="text-xl font-semibold mt-1">{formatCurrency(calculations.monthlyOperationalCost)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-400">Total Monthly Cost</Label>
                                        <p className="text-xl font-semibold mt-1">{formatCurrency(calculations.totalMonthlyCost)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Drone Cost Calculator */}
                    <Card className="w-full lg:w-1/2 bg-[#0f1115] border-[#1f2937] text-white">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-6">Drone Cost Calculator</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold mb-4">Drone Costs</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-400">Frame Cost ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={droneInputs.frameCost}
                                                onChange={(e) => setDroneInputs(prev => ({ ...prev, frameCost: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Propulsion Cost ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={droneInputs.propulsionCost}
                                                onChange={(e) => setDroneInputs(prev => ({ ...prev, propulsionCost: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Electronics Cost ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={droneInputs.electronicsCost}
                                                onChange={(e) => setDroneInputs(prev => ({ ...prev, electronicsCost: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Wiring Cost ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={droneInputs.wiringCost}
                                                onChange={(e) => setDroneInputs(prev => ({ ...prev, wiringCost: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Maintenance Cost Over Life ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={droneInputs.maintenanceCostLife}
                                                onChange={(e) => setDroneInputs(prev => ({ ...prev, maintenanceCostLife: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Drone Life (KM)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={droneInputs.droneLifeKm}
                                                onChange={(e) => setDroneInputs(prev => ({ ...prev, droneLifeKm: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Drone Range (KM)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={droneInputs.droneRange}
                                                onChange={(e) => setDroneInputs(prev => ({ ...prev, droneRange: e.target.value }))}
                                                className="bg-[#1f2937] border-0 mt-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-[#1f2937] rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label className="text-gray-400">Total Life Cost</Label>
                                            <p className="text-xl font-semibold mt-1">{formatCurrency(calculations.droneTotalCost)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Cost per KM</Label>
                                            <p className="text-xl font-semibold mt-1">{formatCurrency(calculations.droneCostPerKm)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-gray-400">Cost per Flight</Label>
                                            <p className="text-xl font-semibold mt-1">{formatCurrency(calculations.costPerFlight)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Battery Cost Calculator */}
                <Card className="w-full bg-[#0f1115] border-[#1f2937] text-white">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-6">Battery Cost Calculator</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-400">Battery Cost ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={batteryInputs.batteryCost}
                                    onChange={(e) => setBatteryInputs(prev => ({ ...prev, batteryCost: e.target.value }))}
                                    className="bg-[#1f2937] border-0 mt-2"
                                />
                            </div>
                            <div>
                                <Label className="text-gray-400">Battery Life Cycles</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={batteryInputs.batteryLifeCycles}
                                    onChange={(e) => setBatteryInputs(prev => ({ ...prev, batteryLifeCycles: e.target.value }))}
                                    className="bg-[#1f2937] border-0 mt-2"
                                />
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-[#1f2937] rounded-lg flex justify-between">
                            <div>
                                <Label className="text-gray-400">Battery Cost</Label>
                                <p className="text-xl font-semibold mt-1">{formatCurrency(Number(batteryInputs.batteryCost))}</p>
                            </div>
                            <div>
                                <Label className="text-gray-400">Cost per Cycle</Label>
                                <p className="text-xl font-semibold mt-1">{formatCurrency(calculations.batteryCostPerCycle)}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Operational Inputs */}
                <Card className="w-full bg-[#0f1115] border-[#1f2937] text-white">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-6">Operational Inputs</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-400">Revenue Calculation Method</Label>
                                <Select
                                    value={operationalInputs.usePercentage ? 'percentage' : 'fixed'}
                                    onValueChange={(value) => setOperationalInputs(prev => ({ ...prev, usePercentage: value === 'percentage' }))}
                                >
                                    <SelectTrigger className="w-full bg-[#1f2937] border-0 mt-2">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage over cost</SelectItem>
                                        <SelectItem value="fixed">Fixed revenue per flight</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {operationalInputs.usePercentage ? (
                                <div>
                                    <Label className="text-gray-400">Percentage over Cost (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={operationalInputs.percentageOverCost}
                                        onChange={(e) => setOperationalInputs(prev => ({ ...prev, percentageOverCost: e.target.value }))}
                                        className="bg-[#1f2937] border-0 mt-2"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <Label className="text-gray-400">Revenue per Flight ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={operationalInputs.revenuePerFlight}
                                        onChange={(e) => setOperationalInputs(prev => ({ ...prev, revenuePerFlight: e.target.value }))}
                                        className="bg-[#1f2937] border-0 mt-2"
                                    />
                                </div>
                            )}
                            <div>
                                <Label className="text-gray-400">Number of Working Days in a Month</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={operationalInputs.workingDaysPerMonth}
                                    onChange={(e) => setOperationalInputs(prev => ({ ...prev, workingDaysPerMonth: e.target.value }))}
                                    className="bg-[#1f2937] border-0 mt-2"
                                />
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-[#1f2937] rounded-lg flex justify-between">
                            <div>
                                <Label className="text-gray-400">Calculated Revenue per Flight</Label>
                                <p className="text-xl font-semibold mt-1">{formatCurrency(calculations.revenuePerFlight)}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* What-If Analysis */}
                <Card className="w-full bg-[#0f1115] border-[#1f2937] text-white">
                    <CardHeader>
                        <CardTitle>Drone Operations What-If Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Input Parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label className="text-gray-400">Total Cost per Flight ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                <p className="text-xl font-semibold mt-1 bg-[#1f2937] p-2 rounded">{formatCurrency(calculations.totalCostPerFlight)}</p>
                            </div>
                            <div>
                                <Label className="text-gray-400">Revenue per Flight ({currencies[selectedCurrency as keyof typeof currencies].symbol})</Label>
                                <p className="text-xl font-semibold mt-1 bg-[#1f2937] p-2 rounded">
                                    {formatCurrency(calculations.whatIfData[0]?.revenuePerFlight || 0)}
                                </p>
                            </div>
                            <div>
                                <Label className="text-gray-400">Working Days/Month</Label>
                                <p className="text-xl font-semibold mt-1 bg-[#1f2937] p-2 rounded">{operationalInputs.workingDaysPerMonth}</p>
                            </div>
                        </div>

                        {/* Break-even Point */}
                        <div className="bg-[#1f2937] p-4 rounded-lg w-full md:w-64">
                            <div className="text-gray-400 text-sm">Break-even Point</div>
                            <div className="text-2xl font-bold text-green-500">{calculations.breakEvenPoint} flights/day</div>
                        </div>

                        {/* Chart */}
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-[800px] h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={calculations.whatIfData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                        <XAxis
                                            dataKey="dailyFlights"
                                            stroke="#fff"
                                            label={{
                                                value: 'Daily Flights',
                                                position: 'bottom',
                                                fill: '#fff',
                                                offset: 40
                                            }}
                                            ticks={[0, 100, 200, 300, 400, 500]}
                                        />
                                        <YAxis
                                            stroke="#fff"
                                            label={{
                                                value: `Amount (${currencies[selectedCurrency as keyof typeof currencies].symbol})`,
                                                angle: -90,
                                                position: 'insideLeft',
                                                fill: '#fff',
                                                offset: -10
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value: number) => `${currencies[selectedCurrency as keyof typeof currencies].symbol}${(value/100000).toFixed(2)}L`}
                                        />
                                        <Legend
                                            verticalAlign="top"
                                            height={36}
                                        />
                                        <ReferenceLine y={0} stroke="#666" />
                                        <Line type="monotone" dataKey="costs" stroke="#ef4444" name="Total Costs" />
                                        <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="Revenue" />
                                        <Line type="monotone" dataKey="profitLoss" stroke="#60a5fa" name="Profit/Loss" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Updated Cost per Flight vs Daily Flights Chart */}
                        <div className="w-full overflow-x-auto mt-8">
                            <h3 className="text-xl font-semibold mb-4">Cost, Revenue, and Profit/Loss per Flight vs Daily Flights</h3>
                            <div className="min-w-[800px] h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={calculations.whatIfData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                        <XAxis
                                            dataKey="dailyFlights"
                                            stroke="#fff"
                                            label={{
                                                value: 'Daily Flights',
                                                position: 'bottom',
                                                fill: '#fff',
                                                offset: 40
                                            }}
                                        />
                                        <YAxis
                                            stroke="#fff"
                                            label={{
                                                value: `Amount (${currencies[selectedCurrency as keyof typeof currencies].symbol})`,
                                                angle: -90,
                                                position: 'insideLeft',
                                                fill: '#fff',
                                                offset: -10
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value: number) => `${currencies[selectedCurrency as keyof typeof currencies].symbol}${value.toFixed(2)}`}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="costPerFlight" stroke="#ef4444" name="Cost per Flight" />
                                        <Line type="monotone" dataKey="revenuePerFlight" stroke="#22c55e" name="Revenue per Flight" />
                                        <Line type="monotone" dataKey="profitLossPerFlight" stroke="#60a5fa" name="Profit/Loss per Flight" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#1f2937] text-white">
                                        <th className="p-3 text-left text-white">Daily Flights</th>
                                        <th className="p-3 text-right text-white">Total Monthly Flights</th>
                                        <th className="p-3 text-right text-white">Cost/Flight ({currencies[selectedCurrency as keyof typeof currencies].symbol})</th>
                                        <th className="p-3 text-right text-white">Revenue/Flight ({currencies[selectedCurrency as keyof typeof currencies].symbol})</th>
                                        <th className="p-3 text-right text-white">Total Costs ({currencies[selectedCurrency as keyof typeof currencies].symbol})</th>
                                        <th className="p-3 text-right text-white">Total Revenue ({currencies[selectedCurrency as keyof typeof currencies].symbol})</th>
                                        <th className="p-3 text-right text-white">Profit/Loss ({currencies[selectedCurrency as keyof typeof currencies].symbol})</th>
                                        <th className="p-3 text-right text-white">Profit/Loss/Flight ({currencies[selectedCurrency as keyof typeof currencies].symbol})</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calculations.whatIfData.map((point, index) => (
                                        <tr key={index} className="border-b border-[#1f2937] text-white">
                                            <td className="p-3">{point.dailyFlights}</td>
                                            <td className="p-3 text-right">{point.monthlyFlights}</td>
                                            <td className="p-3 text-right">{formatCurrency(point.costPerFlight)}</td>
                                            <td className="p-3 text-right">{formatCurrency(point.revenuePerFlight)}</td>
                                            <td className="p-3 text-right">{formatCurrency(point.costs)}</td>
                                            <td className="p-3 text-right">{formatCurrency(point.revenue)}</td>
                                            <td className="p-3 text-right">{formatCurrency(point.profitLoss)}</td>
                                            <td className="p-3 text-right">{formatCurrency(point.profitLossPerFlight)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


export default function RedwingDroneCalculator() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // Initialize as null

  useEffect(() => {
      // Check if we are in a browser environment before using localStorage
      if (typeof window !== 'undefined') {
          const loggedIn = localStorage.getItem('loggedIn');
          setIsLoggedIn(loggedIn === 'true');
      } else {
          setIsLoggedIn(false); // Default to not logged in during SSR
      }
  }, [router]);

  if (isLoggedIn === null) {
      return null; // Or you can return a loading indicator here if you want
  }

  if (!isLoggedIn) {
      router.push('/login'); // Redirect to login page if not logged in
      return null; // Prevent rendering calculator content before redirect
  }

  return <RedwingDroneCalculatorComponent />;
}