import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(join(__dirname, 'public')));

const supabaseUrl = 'https://mnhwkmcnammwycsiudku.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uaHdrbWNuYW1td3ljc2l1ZGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTAzNjEsImV4cCI6MjA1NDI2NjM2MX0.m-OgOXybV8AU0zHCJwYTm6B4rwcHqSHAtPnFZszlSEs";
const supabase = createClient(supabaseUrl, supabaseKey)


app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.post('/login', async (req, res) => {
    const { userid, passwordHash } = req.body;
    if (!userid || !passwordHash) return res.status(400).send("Missing userid or password");


    const {data, error} = await supabase
        .from('users')
        .select()
        .eq('userid',userid)
        .single();


    if (error || !data) return res.send("No User Found");

    if (data.password_hash != passwordHash) return res.send("Incorrect Password");

    if (data.role == 'basic') return res.json({ success: true, user: data });

    const {data: allUsers, error: adminError} = await supabase
            .from('users')
            .select();

    if (adminError) return res.status(500).send("Database error");    
    return res.json({ success: true, allUsers: allUsers });
});


const port = process.env.PORT || 3000; // Reads Port from ENV
app.listen(port, () => console.log(`Listening on port ${port}...`));
