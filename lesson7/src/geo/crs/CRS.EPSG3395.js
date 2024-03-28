import { WebMercator } from "../projection/web-mercator";
/*
 * @namespace CRS
 * @crs L.CRS.EPSG3395
 *
 * Rarely used by some commercial tile providers. Uses Elliptical Mercator projection.
 */
export  class EPSG3395{
	code= 'EPSG:3395';
	projection=Mercator;
};
