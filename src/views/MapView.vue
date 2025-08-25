<template>
  <section class="map-section">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-4 text-white">
          <i class="fas fa-map-marked-alt me-2"></i>Mental Health Resources Map
        </h1>
        <p class="text-center text-white-50 mb-5">Find mental health services and support resources near you</p>
      </div>
    </div>

    <div class="card shadow-lg">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0"><i class="fas fa-search me-2"></i>Resource Locator</h5>
      </div>
      <div class="card-body">
        <div class="row mb-4">
          <div class="col-md-6">
            <label class="form-label fw-bold">Search by Location</label>
            <div class="input-group">
              <input type="text" class="form-control" placeholder="Enter your location or postcode" />
              <button class="btn btn-primary" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-bold">Service Type</label>
            <select class="form-select">
              <option>All Services</option>
              <option>Counselling</option>
              <option>Crisis Support</option>
              <option>Youth Services</option>
              <option>Online Support</option>
            </select>
          </div>
        </div>
        
        <div class="map-container">
          <div class="map-placeholder">
            <i class="fas fa-map fa-3x text-muted mb-3"></i>
            <h4 class="text-muted">Interactive Map Coming Soon</h4>
            <p class="text-muted">This area will display an interactive map with mental health resources</p>
            <div class="mt-3">
              <button class="btn btn-outline-primary me-2">
                <i class="fas fa-location-arrow me-2"></i>Use My Location
              </button>
              <button class="btn btn-outline-secondary">
                <i class="fas fa-list me-2"></i>List View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.map-section {
  padding: 20px 0;
}

.map-container {
  position: relative;
  min-height: 400px;
}

.map-placeholder {
  height: 400px;
  border: 2px dashed #dee2e6;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  transition: all 0.3s ease;
}

.map-placeholder:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f2ff 0%, #e8ecff 100%);
}

.form-select {
  border-radius: 10px;
  border: 2px solid #e9ecef;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.input-group .form-control {
  border-radius: 10px 0 0 10px;
}

.input-group .btn {
  border-radius: 0 10px 10px 0;
}

.btn-outline-primary {
  border-color: #667eea;
  color: #667eea;
  border-radius: 25px;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  background-color: #667eea;
  border-color: #667eea;
  transform: translateY(-2px);
}

.btn-outline-secondary {
  border-radius: 25px;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
  transform: translateY(-2px);
}
</style>


