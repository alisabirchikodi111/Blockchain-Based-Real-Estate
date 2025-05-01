import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const AdminPanel = ({ setShowNavigation }) => {
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    price: '',
    residenceType: 'Condo',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    yearBuilt: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === ADMIN_CREDENTIALS.username && 
        loginData.password === ADMIN_CREDENTIALS.password) {
      setIsLoggedIn(true);
      setShowNavigation(false);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create the property object in your required JSON format
    const newProperty = {
      name: formData.name,
      address: formData.address,
      description: formData.description,
      image: imagePreview, // In a real app, you would upload this to IPFS or a server
      id: (properties.length + 1).toString(),
      attributes: [
        { trait_type: "Purchase Price", value: parseFloat(formData.price) },
        { trait_type: "Type of Residence", value: formData.residenceType },
        { trait_type: "Bed Rooms", value: parseInt(formData.bedrooms) },
        { trait_type: "Bathrooms", value: parseInt(formData.bathrooms) },
        { trait_type: "Square Feet", value: parseInt(formData.sqft) },
        { trait_type: "Year Built", value: parseInt(formData.yearBuilt) }
      ]
    };

    // Add to properties list
    setProperties([...properties, newProperty]);
    
    console.log('New Property Added:', newProperty);
    alert('Property added successfully! (check console for JSON output)');

    // Reset form
    setFormData({
      name: '',
      description: '',
      address: '',
      price: '',
      residenceType: 'Condo',
      bedrooms: '',
      bathrooms: '',
      sqft: '',
      yearBuilt: '',
      image: null,
    });
    setImagePreview(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowNavigation(true);
    setLoginData({ username: '', password: '' });
    navigate('/');
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
                required
                placeholder="Enter admin username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                placeholder="Enter password"
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="login-button">
              Login
            </button>
            <p className="demo-credentials">
              Demo credentials: admin / admin123
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="logout-button">Sign Out</button>
      </div>
      
      <div className="admin-content">
        <div className="add-property-form">
          <h3>Add New Property</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Property Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price (ETH)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Residence Type</label>
                <select
                  name="residenceType"
                  value={formData.residenceType}
                  onChange={handleChange}
                  required
                >
                  <option value="Condo">Condo</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                </select>
              </div>
              <div className="form-group">
                <label>Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                  min="1"
                  step="0.5"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Square Feet</label>
                <input
                  type="number"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleChange}
                  required
                  min="100"
                />
              </div>
              <div className="form-group">
                <label>Year Built</label>
                <input
                  type="number"
                  name="yearBuilt"
                  value={formData.yearBuilt}
                  onChange={handleChange}
                  required
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Property Image</label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
                required
              />
              {imagePreview && (
                <div className="image-preview-container">
                  <h4>Image Preview:</h4>
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                </div>
              )}
            </div>

            <button type="submit" className="submit-button">Add Property</button>
          </form>
        </div>

        <div className="property-list">
          <h3>Existing Properties ({properties.length})</h3>
          {properties.length > 0 ? (
            <div className="properties-grid">
              {properties.map((property, index) => (
                <div key={index} className="property-card">
                  <img src={property.image} alt={property.name} />
                  <h4>{property.name}</h4>
                  <p>{property.address}</p>
                  <p>{property.attributes[0].value} ETH</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-properties">No properties added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;