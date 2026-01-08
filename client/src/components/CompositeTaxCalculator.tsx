import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  calculateVehicleTax,
  calculateBuildingTax,
  calculateLandTax,
  getVehicleTypes,
  getEuroNorms,
  getBuildingTypes,
  getCityRanks,
  getCityZones,
  getLandTaxScenarios,
  getLandUseCategories,
  VehicleTaxInput,
  BuildingTaxInput,
  LandTaxInput,
  applyEarlyPaymentDiscount,
  isEarlyPaymentEligible,
} from "@/lib/taxCalculations";
import {
  Car,
  Building2,
  Landmark,
  Plus,
  Trash2,
  Edit,
  Calculator,
} from "lucide-react";
import { nanoid } from "nanoid";

// Tipuri pentru bunuri
type AssetItem = {
  id: string;
  type: "vehicle" | "building" | "land";
  description: string;
  tax: number;
  properties: VehicleTaxInput | BuildingTaxInput | LandTaxInput;
};

export default function CompositeTaxCalculator() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [applyDiscount, setApplyDiscount] = useState<boolean>(
    isEarlyPaymentEligible()
  );
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

  // State pentru formular vehicul
  const [vehicleType, setVehicleType] = useState<string>("");
  const [vehicleCapacity, setVehicleCapacity] = useState<string>("");
  const [vehicleEuro, setVehicleEuro] = useState<string>("");
  const [vehicleHybridDiscount, setVehicleHybridDiscount] = useState<string>("0");

  // State pentru formular clădire
  const [buildingType, setBuildingType] = useState<string>("");
  const [buildingArea, setBuildingArea] = useState<string>("");
  const [buildingHasUtilities, setBuildingHasUtilities] = useState<boolean>(true);
  const [buildingCityRank, setBuildingCityRank] = useState<string>("");
  const [buildingCityZone, setBuildingCityZone] = useState<string>("");
  const [buildingLocalRate, setBuildingLocalRate] = useState<number>(0.1);
  const [buildingSpecialUsage, setBuildingSpecialUsage] = useState<string>("none");

  // State pentru formular teren
  const [landScenario, setLandScenario] = useState<string>("");
  const [landAreaM2, setLandAreaM2] = useState<string>("");
  const [landCityZone, setLandCityZone] = useState<string>("");
  const [landCityRank, setLandCityRank] = useState<string>("");
  const [landUseCategory, setLandUseCategory] = useState<string>("");

  // Funcție pentru a genera descriere vehicul
  const generateVehicleDescription = (props: VehicleTaxInput): string => {
    const typeLabel = getVehicleTypes().find((t) => t.value === props.type)?.label || props.type;
    const euroLabel = getEuroNorms().find((e) => e.value === props.euro)?.label || props.euro;
    return `${typeLabel} ${props.capacity} cm³, ${euroLabel}`;
  };

  // Funcție pentru a genera descriere clădire
  const generateBuildingDescription = (props: BuildingTaxInput): string => {
    const typeLabel = `Tip ${props.type}`;
    const utilities = props.hasUtilities ? "cu utilități" : "fără utilități";
    return `${typeLabel}, ${props.area} m², ${utilities}, Rang ${props.cityRank}, Zonă ${props.cityZone}`;
  };

  // Funcție pentru a genera descriere teren
  const generateLandDescription = (props: LandTaxInput): string => {
    const scenarioLabel = getLandTaxScenarios().find((s) => s.value === props.scenario)?.label || props.scenario;
    return `${scenarioLabel}, ${props.areaM2} m²`;
  };

  // Helper pentru resetarea formularului vehicul
  const resetVehicleForm = () => {
    setVehicleType("");
    setVehicleCapacity("");
    setVehicleEuro("");
    setVehicleHybridDiscount("0");
  };

  // Helper pentru resetarea formularului clădire
  const resetBuildingForm = () => {
    setBuildingType("");
    setBuildingArea("");
    setBuildingHasUtilities(true);
    setBuildingCityRank("");
    setBuildingCityZone("");
    setBuildingLocalRate(0.1);
    setBuildingSpecialUsage("none");
  };

  // Helper pentru resetarea formularului teren
  const resetLandForm = () => {
    setLandScenario("");
    setLandAreaM2("");
    setLandCityZone("");
    setLandCityRank("");
    setLandUseCategory("");
  };

  // Adaugă vehicul
  const handleAddVehicle = () => {
    try {
      const input: VehicleTaxInput = {
        type: vehicleType as "car" | "motorcycle" | "bus" | "other",
        capacity: Number(vehicleCapacity),
        euro: vehicleEuro as
          | "euro0_3"
          | "euro4"
          | "euro5"
          | "euro6"
          | "hybrid_le_50"
          | "hybrid_gt_50"
          | "electric",
        localHybridDiscount:
          vehicleEuro === "hybrid_le_50" ? Number(vehicleHybridDiscount) / 100 : 0,
      };

      const calculation = calculateVehicleTax(input);
      const description = generateVehicleDescription(input);

      if (editingAssetId) {
        // Editare
        setAssets((prev) =>
          prev.map((asset) =>
            asset.id === editingAssetId
              ? { ...asset, description, tax: calculation.tax, properties: input }
              : asset
          )
        );
        setEditingAssetId(null);
      } else {
        // Adăugare nouă
        const newAsset: AssetItem = {
          id: nanoid(),
          type: "vehicle",
          description,
          tax: calculation.tax,
          properties: input,
        };
        setAssets((prev) => [...prev, newAsset]);
      }

      // Reset formular
      resetVehicleForm();
    } catch (error) {
      console.error("Eroare la adăugarea vehiculului:", error);
    }
  };

  // Adaugă clădire
  const handleAddBuilding = () => {
    try {
      const input: BuildingTaxInput = {
        type: buildingType as "A" | "B" | "C" | "D",
        area: Number(buildingArea),
        hasUtilities: buildingHasUtilities,
        cityRank: buildingCityRank as "0" | "I" | "II" | "III" | "IV" | "V",
        cityZone: buildingCityZone as "A" | "B" | "C" | "D",
        localRatePercent: buildingLocalRate,
        specialUsage: buildingSpecialUsage as "none" | "locuinta" | "alte_scopuri",
      };

      const calculation = calculateBuildingTax(input);
      const description = generateBuildingDescription(input);

      if (editingAssetId) {
        // Editare
        setAssets((prev) =>
          prev.map((asset) =>
            asset.id === editingAssetId
              ? { ...asset, description, tax: calculation.tax, properties: input }
              : asset
          )
        );
        setEditingAssetId(null);
      } else {
        // Adăugare nouă
        const newAsset: AssetItem = {
          id: nanoid(),
          type: "building",
          description,
          tax: calculation.tax,
          properties: input,
        };
        setAssets((prev) => [...prev, newAsset]);
      }

      // Reset formular
      resetBuildingForm();
    } catch (error) {
      console.error("Eroare la adăugarea clădirii:", error);
    }
  };

  // Adaugă teren
  const handleAddLand = () => {
    try {
      const input: LandTaxInput = {
        scenario: landScenario as "intravilan_construction" | "intravilan_other_large" | "extravilan",
        areaM2: Number(landAreaM2),
        cityZone: landCityZone as "A" | "B" | "C" | "D" | undefined,
        cityRank: landCityRank as "0" | "I" | "II" | "III" | "IV" | "V" | undefined,
        landUseCategory: landUseCategory || undefined,
      };

      const calculation = calculateLandTax(input);
      const description = generateLandDescription(input);

      if (editingAssetId) {
        // Editare
        setAssets((prev) =>
          prev.map((asset) =>
            asset.id === editingAssetId
              ? { ...asset, description, tax: calculation.tax, properties: input }
              : asset
          )
        );
        setEditingAssetId(null);
      } else {
        // Adăugare nouă
        const newAsset: AssetItem = {
          id: nanoid(),
          type: "land",
          description,
          tax: calculation.tax,
          properties: input,
        };
        setAssets((prev) => [...prev, newAsset]);
      }

      // Reset formular
      resetLandForm();
    } catch (error) {
      console.error("Eroare la adăugarea terenului:", error);
    }
  };

  // Șterge un bun
  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== id));
    if (editingAssetId === id) {
      setEditingAssetId(null);
    }
  };

  // Editare bun
  const handleEditAsset = (asset: AssetItem) => {
    setEditingAssetId(asset.id);

    if (asset.type === "vehicle") {
      const props = asset.properties as VehicleTaxInput;
      setVehicleType(props.type);
      setVehicleCapacity(String(props.capacity));
      setVehicleEuro(props.euro);
      setVehicleHybridDiscount(String((props.localHybridDiscount || 0) * 100));
    } else if (asset.type === "building") {
      const props = asset.properties as BuildingTaxInput;
      setBuildingType(props.type);
      setBuildingArea(String(props.area));
      setBuildingHasUtilities(props.hasUtilities);
      setBuildingCityRank(props.cityRank);
      setBuildingCityZone(props.cityZone);
      setBuildingLocalRate(props.localRatePercent);
      setBuildingSpecialUsage(props.specialUsage || "none");
    } else if (asset.type === "land") {
      const props = asset.properties as LandTaxInput;
      setLandScenario(props.scenario);
      setLandAreaM2(String(props.areaM2));
      setLandCityZone(props.cityZone || "");
      setLandCityRank(props.cityRank || "");
      setLandUseCategory(props.landUseCategory || "");
    }
  };

  // Helper pentru validarea formularului teren
  const isLandFormValid = (): boolean => {
    if (!landScenario || !landAreaM2) return false;
    
    if (landScenario === "intravilan_construction") {
      return !!(landCityZone && landCityRank);
    }
    
    if (landScenario === "intravilan_other_large") {
      return !!(landCityZone && landCityRank && landUseCategory);
    }
    
    if (landScenario === "extravilan") {
      return !!(landCityRank && landUseCategory);
    }
    
    return false;
  };

  // Calculează totalurile
  const vehicleAssets = assets.filter((a) => a.type === "vehicle");
  const buildingAssets = assets.filter((a) => a.type === "building");
  const landAssets = assets.filter((a) => a.type === "land");

  const vehicleTotal = vehicleAssets.reduce((sum, a) => sum + a.tax, 0);
  const buildingTotal = buildingAssets.reduce((sum, a) => sum + a.tax, 0);
  const landTotal = landAssets.reduce((sum, a) => sum + a.tax, 0);
  const grandTotal = vehicleTotal + buildingTotal + landTotal;

  const vehicleDiscounted = applyEarlyPaymentDiscount(vehicleTotal, applyDiscount);
  const buildingDiscounted = applyEarlyPaymentDiscount(buildingTotal, applyDiscount);
  const landDiscounted = applyEarlyPaymentDiscount(landTotal, applyDiscount);
  const grandDiscounted = applyEarlyPaymentDiscount(grandTotal, applyDiscount);

  return (
    <div className="space-y-6">
      {/* Instrucțiuni */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">
          <Calculator className="w-5 h-5 inline-block mr-2" />
          Calcul impozit compus
        </h3>
        <p className="text-sm text-blue-800">
          Adaugă toate bunurile tale (vehicule, clădiri, terenuri) pentru a calcula impozitul total.
          Poți edita sau șterge bunurile adăugate oricând.
        </p>
      </div>

      {/* Bifă reducere 10% */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Checkbox
          id="early-payment-discount-composite"
          checked={applyDiscount}
          onCheckedChange={(checked) => setApplyDiscount(checked as boolean)}
        />
        <Label htmlFor="early-payment-discount-composite" className="cursor-pointer flex-1">
          <span className="font-semibold text-blue-900">
            Reducere de 10% (plată anticipată până la 31 martie 2026)
          </span>
          <p className="text-xs text-blue-700 mt-1">
            Reducerea se aplică pentru plata integrală a impozitului până la 31 martie a anului fiscal curent, conform legislației în vigoare.
          </p>
        </Label>
      </div>

      {/* Formulare pentru adăugare bunuri */}
      <Accordion type="single" collapsible className="w-full">
        {/* Formular vehicul */}
        <AccordionItem value="vehicle">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              <span>Adaugă vehicul</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tip vehicul</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează tipul" />
                    </SelectTrigger>
                    <SelectContent>
                      {getVehicleTypes().map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cilindree (cm³)</Label>
                  <Input
                    type="number"
                    placeholder="ex: 1800"
                    value={vehicleCapacity}
                    onChange={(e) => setVehicleCapacity(e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Normă Euro</Label>
                  <Select value={vehicleEuro} onValueChange={setVehicleEuro}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează norma" />
                    </SelectTrigger>
                    <SelectContent>
                      {getEuroNorms().map((norm) => (
                        <SelectItem key={norm.value} value={norm.value}>
                          {norm.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {vehicleEuro === "hybrid_le_50" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Reducere locală hibrid ≤50g (0-30%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[Number(vehicleHybridDiscount)]}
                        onValueChange={(vals) => setVehicleHybridDiscount(String(vals[0] ?? 0))}
                        min={0}
                        max={30}
                        step={1}
                        className="flex-1"
                      />
                      <div className="text-sm font-medium w-16 text-right">
                        {vehicleHybridDiscount}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleAddVehicle}
                className="w-full"
                disabled={!vehicleType || !vehicleCapacity || !vehicleEuro}
              >
                <Plus className="w-4 h-4 mr-2" />
                {editingAssetId ? "Actualizează vehicul" : "Adaugă vehicul"}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Formular clădire */}
        <AccordionItem value="building">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <span>Adaugă clădire</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Tip clădire</Label>
                  <Select value={buildingType} onValueChange={setBuildingType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează tipul" />
                    </SelectTrigger>
                    <SelectContent>
                      {getBuildingTypes().map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Suprafață (m²)</Label>
                  <Input
                    type="number"
                    placeholder="ex: 100"
                    value={buildingArea}
                    onChange={(e) => setBuildingArea(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rang localitate</Label>
                  <Select value={buildingCityRank} onValueChange={setBuildingCityRank}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează rangul" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCityRanks().map((rank) => (
                        <SelectItem key={rank.value} value={rank.value}>
                          {rank.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Zonă (A-D)</Label>
                  <Select value={buildingCityZone} onValueChange={setBuildingCityZone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCityZones().map((zone) => (
                        <SelectItem key={zone.value} value={zone.value}>
                          {zone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cotă locală (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      // Convert: decimal (0.08-0.20) -> slider value (8-20) for display
                      value={[Math.round(buildingLocalRate * 10000) / 100]}
                      // Convert: slider value (8-20) -> decimal (0.08-0.20) for storage
                      onValueChange={(vals) => setBuildingLocalRate((vals[0] ?? 8) / 100)}
                      min={8}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <div className="text-sm font-medium w-20 text-right">
                      {buildingLocalRate.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="building-utilities"
                      checked={buildingHasUtilities}
                      onCheckedChange={(checked) => setBuildingHasUtilities(checked as boolean)}
                    />
                    <Label htmlFor="building-utilities" className="cursor-pointer">
                      Are utilități (apă/canalizare/curent/încălzire)
                    </Label>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Încăperi S/D/M</Label>
                  <Select value={buildingSpecialUsage} onValueChange={setBuildingSpecialUsage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează opțiunea" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nu se aplică</SelectItem>
                      <SelectItem value="locuinta">Locuință (75%)</SelectItem>
                      <SelectItem value="alte_scopuri">Alte scopuri (50%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleAddBuilding}
                className="w-full"
                disabled={
                  !buildingType ||
                  !buildingArea ||
                  !buildingCityRank ||
                  !buildingCityZone
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                {editingAssetId ? "Actualizează clădire" : "Adaugă clădire"}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Formular teren */}
        <AccordionItem value="land">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5" />
              <span>Adaugă teren</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Tip teren</Label>
                  <Select value={landScenario} onValueChange={setLandScenario}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează tipul" />
                    </SelectTrigger>
                    <SelectContent>
                      {getLandTaxScenarios().map((scenario) => (
                        <SelectItem key={scenario.value} value={scenario.value}>
                          {scenario.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Suprafață (m²)</Label>
                  <Input
                    type="number"
                    placeholder="ex: 5000"
                    value={landAreaM2}
                    onChange={(e) => setLandAreaM2(e.target.value)}
                  />
                </div>

                {(landScenario === "intravilan_construction" ||
                  landScenario === "intravilan_other_large") && (
                  <>
                    <div className="space-y-2">
                      <Label>Zonă (A-D)</Label>
                      <Select value={landCityZone} onValueChange={setLandCityZone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează zona" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCityZones().map((zone) => (
                            <SelectItem key={zone.value} value={zone.value}>
                              {zone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Rang localitate</Label>
                      <Select value={landCityRank} onValueChange={setLandCityRank}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează rangul" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCityRanks().map((rank) => (
                            <SelectItem key={rank.value} value={rank.value}>
                              {rank.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {landScenario === "extravilan" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Rang localitate</Label>
                    <Select value={landCityRank} onValueChange={setLandCityRank}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează rangul" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCityRanks().map((rank) => (
                          <SelectItem key={rank.value} value={rank.value}>
                            {rank.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(landScenario === "intravilan_other_large" ||
                  landScenario === "extravilan") && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Categorie folosință</Label>
                    <Select value={landUseCategory} onValueChange={setLandUseCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {getLandUseCategories().map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button
                onClick={handleAddLand}
                className="w-full"
                disabled={!isLandFormValid()}
              >
                <Plus className="w-4 h-4 mr-2" />
                {editingAssetId ? "Actualizează teren" : "Adaugă teren"}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Lista bunuri adăugate */}
      {assets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Bunuri adăugate</h3>

          {/* Vehicule */}
          {vehicleAssets.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Vehicule ({vehicleAssets.length})
              </h4>
              {vehicleAssets.map((asset) => {
                const discounted = applyEarlyPaymentDiscount(asset.tax, applyDiscount);
                return (
                  <Card key={asset.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{asset.description}</p>
                        <div className="mt-2 text-sm space-y-1">
                          <p className="text-slate-600">
                            Fără reducere: <span className="font-semibold">{discounted.originalTax.toFixed(2)} lei</span>
                          </p>
                          {applyDiscount && (
                            <p className="text-blue-700">
                              Cu reducere 10%: <span className="font-semibold">{discounted.finalTax.toFixed(2)} lei</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAsset(asset)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAsset(asset.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Clădiri */}
          {buildingAssets.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Clădiri ({buildingAssets.length})
              </h4>
              {buildingAssets.map((asset) => {
                const discounted = applyEarlyPaymentDiscount(asset.tax, applyDiscount);
                return (
                  <Card key={asset.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{asset.description}</p>
                        <div className="mt-2 text-sm space-y-1">
                          <p className="text-slate-600">
                            Fără reducere: <span className="font-semibold">{discounted.originalTax.toFixed(2)} lei</span>
                          </p>
                          {applyDiscount && (
                            <p className="text-blue-700">
                              Cu reducere 10%: <span className="font-semibold">{discounted.finalTax.toFixed(2)} lei</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAsset(asset)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAsset(asset.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Terenuri */}
          {landAssets.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                <Landmark className="w-4 h-4" />
                Terenuri ({landAssets.length})
              </h4>
              {landAssets.map((asset) => {
                const discounted = applyEarlyPaymentDiscount(asset.tax, applyDiscount);
                return (
                  <Card key={asset.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{asset.description}</p>
                        <div className="mt-2 text-sm space-y-1">
                          <p className="text-slate-600">
                            Fără reducere: <span className="font-semibold">{discounted.originalTax.toFixed(2)} lei</span>
                          </p>
                          {applyDiscount && (
                            <p className="text-blue-700">
                              Cu reducere 10%: <span className="font-semibold">{discounted.finalTax.toFixed(2)} lei</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAsset(asset)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAsset(asset.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Card totalizare */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 mt-6">
            <h3 className="text-2xl font-bold text-green-900 mb-4">Totalizare impozite</h3>

            <div className="space-y-4">
              {/* Total pe categorii */}
              {vehicleAssets.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    VEHICULE:
                  </p>
                  <p className="text-slate-600">
                    Total fără reducere: <span className="font-bold">{vehicleDiscounted.originalTax.toFixed(2)} lei</span>
                  </p>
                  {applyDiscount && (
                    <p className="text-blue-700">
                      Total cu reducere 10%: <span className="font-bold">{vehicleDiscounted.finalTax.toFixed(2)} lei</span>
                    </p>
                  )}
                </div>
              )}

              {buildingAssets.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    CLĂDIRI:
                  </p>
                  <p className="text-slate-600">
                    Total fără reducere: <span className="font-bold">{buildingDiscounted.originalTax.toFixed(2)} lei</span>
                  </p>
                  {applyDiscount && (
                    <p className="text-blue-700">
                      Total cu reducere 10%: <span className="font-bold">{buildingDiscounted.finalTax.toFixed(2)} lei</span>
                    </p>
                  )}
                </div>
              )}

              {landAssets.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Landmark className="w-4 h-4" />
                    TERENURI:
                  </p>
                  <p className="text-slate-600">
                    Total fără reducere: <span className="font-bold">{landDiscounted.originalTax.toFixed(2)} lei</span>
                  </p>
                  {applyDiscount && (
                    <p className="text-blue-700">
                      Total cu reducere 10%: <span className="font-bold">{landDiscounted.finalTax.toFixed(2)} lei</span>
                    </p>
                  )}
                </div>
              )}

              {/* Total general */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-300 mt-4">
                <p className="text-lg font-bold text-blue-900 mb-3">TOTAL IMPOZITE:</p>
                <p className="text-slate-700 text-lg">
                  Total fără reducere: <span className="font-bold">{grandDiscounted.originalTax.toFixed(2)} lei</span>
                </p>
                {applyDiscount && (
                  <>
                    <p className="text-blue-700 text-lg">
                      Reducere 10%: <span className="font-bold">-{grandDiscounted.discount.toFixed(2)} lei</span>
                    </p>
                    <div className="border-t-2 border-blue-300 my-3"></div>
                    <p className="text-2xl font-bold text-blue-900">
                      TOTAL DE PLATĂ: {grandDiscounted.finalTax.toFixed(2)} lei
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Mesaj dacă nu sunt bunuri */}
      {assets.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Calculator className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium">Nu ai adăugat încă niciun bun</p>
          <p className="text-sm">Folosește formularele de mai sus pentru a adăuga vehicule, clădiri sau terenuri</p>
        </div>
      )}
    </div>
  );
}
