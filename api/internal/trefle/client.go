package trefle

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

const baseURL = "https://trefle.io/api/v1"

type Client struct {
	token  string
	client *http.Client
}

func New(token string) *Client {
	if token == "" {
		return nil
	}
	return &Client{
		token: token,
		client: &http.Client{Timeout: 15 * time.Second},
	}
}

func (c *Client) Enabled() bool {
	return c != nil && c.token != ""
}

type SearchHit struct {
	ID             int     `json:"id"`
	Slug           string  `json:"slug"`
	CommonName     *string `json:"common_name"`
	ScientificName string  `json:"scientific_name"`
	ImageURL       *string `json:"image_url"`
	Family         string  `json:"family"`
	Genus          string  `json:"genus"`
}

type SpeciesDetail struct {
	ID             int             `json:"id"`
	Slug           string          `json:"slug"`
	CommonName     *string         `json:"common_name"`
	ScientificName string          `json:"scientific_name"`
	ImageURL       *string         `json:"image_url"`
	Family         string          `json:"family"`
	Genus          string          `json:"genus"`
	Growth         *Growth         `json:"growth"`
	Specifications *Specifications `json:"specifications"`
}

type Growth struct {
	Description         *string `json:"description"`
	Light               *int    `json:"light"`
	SoilHumidity        *int    `json:"soil_humidity"`
	AtmosphericHumidity *int    `json:"atmospheric_humidity"`
	DaysToHarvest       *int    `json:"days_to_harvest"`
}

type Specifications struct {
	GrowthHabit string `json:"growth_habit"`
	GrowthForm  string `json:"growth_form"`
	LigneousType string `json:"ligneous_type"`
}

type searchResponse struct {
	Data []SearchHit `json:"data"`
	Meta struct {
		Total int `json:"total"`
	} `json:"meta"`
}

type detailResponse struct {
	Data SpeciesDetail `json:"data"`
}

func (c *Client) Search(ctx context.Context, query string, page int) ([]SearchHit, int, error) {
	if page < 1 {
		page = 1
	}
	q := url.Values{}
	q.Set("token", c.token)
	q.Set("q", query)
	q.Set("page", strconv.Itoa(page))

	var resp searchResponse
	if err := c.get(ctx, "/species/search?"+q.Encode(), &resp); err != nil {
		return nil, 0, err
	}
	return resp.Data, resp.Meta.Total, nil
}

func (c *Client) GetSpecies(ctx context.Context, slug string) (SpeciesDetail, error) {
	q := url.Values{}
	q.Set("token", c.token)

	var resp detailResponse
	if err := c.get(ctx, "/species/"+url.PathEscape(slug)+"?"+q.Encode(), &resp); err != nil {
		return SpeciesDetail{}, err
	}
	return resp.Data, nil
}

func (c *Client) get(ctx context.Context, path string, out any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+path, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/json")

	res, err := c.client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}
	if res.StatusCode >= 400 {
		return fmt.Errorf("trefle api %d: %s", res.StatusCode, string(body))
	}
	if err := json.Unmarshal(body, out); err != nil {
		return err
	}
	return nil
}
