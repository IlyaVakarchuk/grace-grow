package trefle

import (
	"fmt"
	"strings"

	"github.com/vakarchukiv/grace/api/internal/model"
)

func ToPlantSpecies(d SpeciesDetail) model.PlantSpecies {
	name := d.ScientificName
	if d.CommonName != nil && strings.TrimSpace(*d.CommonName) != "" {
		name = strings.TrimSpace(*d.CommonName)
	}

	light := "Не указано"
	humidity := "Не указано"
	waterDays := 7
	fertilizeDays := 30
	repotDays := 365
	desc := buildDescription(d)

	if d.Growth != nil {
		if d.Growth.Light != nil {
			light = formatLight(*d.Growth.Light)
		}
		if d.Growth.SoilHumidity != nil {
			humidity = formatHumidity(*d.Growth.SoilHumidity)
			waterDays = waterDaysFromHumidity(*d.Growth.SoilHumidity)
		} else if d.Growth.AtmosphericHumidity != nil {
			humidity = formatHumidity(*d.Growth.AtmosphericHumidity)
			waterDays = waterDaysFromHumidity(*d.Growth.AtmosphericHumidity)
		}
		if d.Growth.DaysToHarvest != nil && *d.Growth.DaysToHarvest > 0 {
			fertilizeDays = clamp(*d.Growth.DaysToHarvest/4, 14, 90)
		}
	}

	trefleID := d.ID
	return model.PlantSpecies{
		Slug:           d.Slug,
		Name:           name,
		Type:           inferType(d),
		Light:          light,
		Humidity:       humidity,
		WaterDays:      waterDays,
		FertilizeDays:  &fertilizeDays,
		RepotDays:      &repotDays,
		Description:    &desc,
		TrefleID:       &trefleID,
		ImageURL:       d.ImageURL,
		ScientificName: &d.ScientificName,
		Source:         "trefle",
	}
}

func buildDescription(d SpeciesDetail) string {
	parts := []string{
		d.ScientificName,
	}
	if d.Family != "" {
		parts = append(parts, "Семейство: "+d.Family)
	}
	if d.Genus != "" {
		parts = append(parts, "Род: "+d.Genus)
	}
	if d.Growth != nil && d.Growth.Description != nil && strings.TrimSpace(*d.Growth.Description) != "" {
		parts = append(parts, strings.TrimSpace(*d.Growth.Description))
	}
	return strings.Join(parts, ". ")
}

func inferType(d SpeciesDetail) string {
	family := strings.ToLower(d.Family)
	genus := strings.ToLower(d.Genus)
	habit := ""
	if d.Specifications != nil {
		habit = strings.ToLower(d.Specifications.GrowthHabit)
	}

	switch {
	case strings.Contains(genus, "thymus"), strings.Contains(genus, "rosmarinus"):
		return "spice"
	case strings.Contains(family, "solanaceae"), strings.Contains(family, "cucurbitaceae"), strings.Contains(genus, "capsicum"):
		return "vegetable"
	case strings.Contains(family, "lamiaceae"), strings.Contains(family, "apiaceae"), strings.Contains(genus, "ocimum"), strings.Contains(genus, "mentha"):
		return "herb"
	case strings.Contains(family, "citrus"), strings.Contains(family, "rosaceae"):
		return "fruit"
	case habit == "tree", habit == "shrub", strings.Contains(family, "araceae"), strings.Contains(family, "asphodelaceae"):
		return "indoor"
	default:
		return "other"
	}
}

func formatLight(level int) string {
	switch {
	case level <= 2:
		return "Тень"
	case level <= 5:
		return "Рассеянный свет"
	case level <= 8:
		return "Яркий свет"
	default:
		return "Полное солнце"
	}
}

func formatHumidity(level int) string {
	switch {
	case level <= 3:
		return "Низкая, 20-40%"
	case level <= 6:
		return "Умеренная, 40-60%"
	default:
		return "Высокая, 60-80%"
	}
}

func waterDaysFromHumidity(level int) int {
	days := 14 - level
	return clamp(days, 2, 14)
}

func clamp(v, min, max int) int {
	if v < min {
		return min
	}
	if v > max {
		return max
	}
	return v
}

func DisplayName(hit SearchHit) string {
	if hit.CommonName != nil && strings.TrimSpace(*hit.CommonName) != "" {
		return strings.TrimSpace(*hit.CommonName)
	}
	return hit.ScientificName
}

func SearchSubtitle(hit SearchHit) string {
	if hit.ScientificName != "" {
		return fmt.Sprintf("%s · %s", hit.ScientificName, hit.Family)
	}
	return hit.Family
}
