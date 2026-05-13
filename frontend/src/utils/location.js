const LOCATION_STORAGE_KEY = "collabx-user-location";

const buildLocationLabel = (data = {}) =>
  [
    data.locality,
    data.city,
    data.principalSubdivision,
    data.countryName,
  ]
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .join(", ");

const reverseGeocodeLocation = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const label = buildLocationLabel(data);

    return label
      ? {
          label,
          city: data.city || data.locality || "",
          locality: data.locality || "",
          region: data.principalSubdivision || "",
          country: data.countryName || "",
        }
      : null;
  } catch {
    return null;
  }
};

export const getStoredLocation = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCATION_STORAGE_KEY) || "null");
    if (Number.isFinite(Number(saved?.latitude)) && Number.isFinite(Number(saved?.longitude))) {
      return saved;
    }
  } catch {
    return null;
  }

  return null;
};

export const clearStoredLocation = () => {
  localStorage.removeItem(LOCATION_STORAGE_KEY);
};

export const getLocationPermissionState = async () => {
  if (!navigator.permissions?.query) return "prompt";

  try {
    const permission = await navigator.permissions.query({
      name: "geolocation",
    });

    return permission.state;
  } catch {
    return "prompt";
  }
};

export const requestBrowserLocation = () =>
  new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const reverseLocation = await reverseGeocodeLocation(
          position.coords.latitude,
          position.coords.longitude
        );

        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          ...(reverseLocation || {}),
          capturedAt: new Date().toISOString(),
        };

        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
        resolve(location);
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 0,
      }
    );
  });

export const buildClientContext = (location) => ({
  location: location || getStoredLocation(),
});

export const needsLocationForTicketing = (text = "") =>
  /\b(movie|film|cinema|theatre|theater|hotel|room|stay|event|concert|show|match|festival)\b/i.test(text) &&
  !/\b(flight|train|bus|airport|railway)\b/i.test(text);
