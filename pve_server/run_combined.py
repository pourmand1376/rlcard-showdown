import os
import sys
import importlib.util

from flask import Flask, jsonify, request, Blueprint
from flask_cors import CORS

# Create the main application
app = Flask(__name__)
CORS(app)

# Function to import a Python file as a module
def import_file_as_module(file_path, module_name):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module

# Import run_dmc.py and run_hokm.py as modules
dmc_module_path = os.path.join(os.path.dirname(__file__), 'run_dmc.py')
hokm_module_path = os.path.join(os.path.dirname(__file__), 'run_hokm.py')

# Create blueprints for each module
dmc_bp = Blueprint('dmc', __name__, url_prefix='/dmc')
hokm_bp = Blueprint('hokm', __name__, url_prefix='/hokm')

# Helper function to extract Flask routes from a module and register them to a blueprint
def register_routes_to_blueprint(module, blueprint):
    # Get the Flask app from the module
    module_app = module.app
    
    # Copy routes from module_app to the blueprint
    for rule in module_app.url_map.iter_rules():
        endpoint = rule.endpoint
        
        if endpoint == 'static':
            continue
            
        view_func = module_app.view_functions[endpoint]
        
        # Remove the leading slash from the rule to avoid double slashes
        url = str(rule)
        if url.startswith('/'):
            url = url[1:]
            
        # Register the route to the blueprint
        blueprint.route(url, methods=rule.methods)(view_func)

# Function to setup and run the combined app
def setup_combined_app():
    try:
        # Import modules
        dmc_module = import_file_as_module(dmc_module_path, 'dmc_module')
        hokm_module = import_file_as_module(hokm_module_path, 'hokm_module')
        
        # Register routes to blueprints
        register_routes_to_blueprint(dmc_module, dmc_bp)
        register_routes_to_blueprint(hokm_module, hokm_bp)
        
        # Register blueprints to the main app
        app.register_blueprint(dmc_bp)
        app.register_blueprint(hokm_bp)
        
        # Add a root route for health check
        @app.route('/')
        def index():
            return jsonify({
                'status': 'ok',
                'message': 'Combined PvE server is running',
                'available_modules': ['dmc', 'hokm']
            })
        
        return True
    except Exception as e:
        print(f"Error setting up combined app: {e}")
        return False

# Setup the combined app
if setup_combined_app():
    print("Successfully set up combined PvE server")
else:
    print("Failed to set up combined PvE server")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 