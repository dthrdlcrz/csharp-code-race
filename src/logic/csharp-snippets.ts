export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: 'csharp';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export const EasySnippets: string[] = [
    "return true;", "return false;", "int x = 10;", "int y = 5;", "score += 1;",
    "health -= 10;", "mana += 5;", "Console.ReadKey();", "Console.Clear();", "break;",
    "continue;", "player.Jump();", "enemy.Attack();", "game.Start();", "game.Stop();",
    "bool isReady = true;", "bool isDead = false;", "float voltage = 1.0f;", "double pi = 3.14;",
    "string name = \"Dev\";", "string title = \"DSAS\";", "Application.Exit();", "this.Close();",
    "txtName.Clear();", "lblScore.Text = \"100\";", "progressBar1.Value = 50;", "Random rnd = new Random();",
    "DateTime now = DateTime.Now;", "timer1.Start();", "timer1.Stop();", "File.Delete(path);",
    "File.Exists(path);", "Console.WriteLine(x);", "MessageBox.Show(\"Error\");", "Cursor.Hide();",
    "Cursor.Show();", "listBox1.Items.Clear();", "comboBox1.SelectedIndex = 0;",
    "pictureBox1.Visible = true;", "pictureBox1.Visible = false;", "btnRun.Enabled = true;",
    "btnRun.Enabled = false;", "Thread.Sleep(500);", "GC.Collect();", "queue.Clear();",
    "stack.Push(value);", "stack.Pop();", "visited.Add(node);", "nodes.Remove(current);", "engine.Run();"
];

export const NormalSnippets: string[] = [
    "for (int i = 0; i < 10; i++)", "while (isRunning)", "if (score >= highScore)",
    "if (health <= 0)", "foreach (var item in items)", "List<string> users = new List<string>();",
    "Dictionary<int, string> lookup;", "queue.Enqueue(nextBus);", "visited.Add(currentNode);",
    "Random rnd = new Random();", "DateTime now = DateTime.Now;", "await Task.Delay(1000);",
    "Console.WriteLine(\"Compiled\");", "SqlConnection conn = new SqlConnection();",
    "File.WriteAllText(path, content);", "File.ReadAllText(path);", "engine.RunLoadFlowAnalysis();",
    "engine.RunShortCircuitAnalysis();", "powerGrid.RestoreService();", "BFS(startingBus);",
    "DFS(currentNode);", "lblStatus.ForeColor = Color.Red;", "btnSave.BackColor = Color.Blue;",
    "player.Position += velocity;", "enemy.Health -= damage;", "customerCount += interruptedLoads;",
    "transformer.LoadPercent = 120.0;", "FaultCurrent = voltage / impedance;", "VoltageViolationDetected();",
    "OverloadAlarmTriggered();", "OpenFileDialog ofd = new OpenFileDialog();",
    "SaveFileDialog sfd = new SaveFileDialog();", "Bitmap bmp = new Bitmap(256, 256);",
    "Graphics g = Graphics.FromImage(bmp);", "Pen pen = new Pen(Color.Blue, 2);",
    "Brush brush = Brushes.Red;", "Rectangle rect = new Rectangle(0,0,100,50);",
    "Invoke(new Action(() => RefreshUI()));", "Thread thread = new Thread(Process);",
    "Process.Start(exePath);", "timer.Interval = 1000;", "Application.DoEvents();",
    "streamReader.Close();", "streamWriter.Flush();", "json = JsonConvert.SerializeObject(data);",
    "data = JsonConvert.DeserializeObject(json);", "using (SqlConnection conn = new SqlConnection())",
    "Parallel.ForEach(events, ProcessEvent);", "machineId = GetDiskSerial();", "LicenseManager.VerifySignature();"
];

export const HardSnippets: string[] = [
    "Dictionary<int, List<string>> feederLookup = new Dictionary<int, List<string>>();",
    "Parallel.ForEach(events, simulationEvent => ProcessReliabilityIndices(simulationEvent));",
    "JsonConvert.DeserializeObject<List<User>>(jsonString);",
    "var response = await client.GetAsync(updateUrl);",
    "foreach (var transformer in overloadedTransformers)",
    "SAIFI = totalInterruptions / totalCustomersServed;",
    "SAIDI = totalDuration / totalCustomersServed;",
    "if (terminalBuses.Count > 1 && hasCommonRootBus)",
    "File.WriteAllText(logPath, exception.ToString());",
    "RSA rsa = RSA.Create(2048);",
    "machineId = GetPhysicalDiskSerialNumber();",
    "ShellExecute(NULL, L\"open\", exePath.c_str(), NULL, NULL, SW_SHOW);",
    "std::queue<int> affectedBusTraversalQueue;",
    "UnicodeString simulationStatus = \"Processing Reliability Events\";",
    "FaultCurrent = SourceVoltage / TotalImpedance;",
    "UpdateReliabilityIndicesUsingIntervalTime();",
    "Dictionary<string, List<Bus>> groupedInterruptedBuses;",
    "NullReferenceException: Object reference not set to an instance of an object.",
    "Unhandled exception has occurred in your application.",
    "Syntax error near unexpected token ';'",
    "Segmentation fault (core dumped)",
    "SELECT * FROM ReliabilityEvents WHERE Duration >= 5 ORDER BY EventTime DESC",
    "Parallel.ForEach(interruptedBuses, bus => UpdateCustomerCount(bus));",
    "Dictionary<string, Dictionary<int, List<InterruptedBus>>> interruptionLookup;",
    "using (StreamWriter sw = new StreamWriter(path))",
    "SqlCommand cmd = new SqlCommand(query, conn);",
    "SqlDataReader reader = cmd.ExecuteReader();",
    "foreach (DataRow row in table.Rows)",
    "if (device.Type == \"RECLOSER\" && device.IsClosed)",
    "License verification failed due to invalid RSA signature.",
    "Process.Start(\"cmd.exe\", \"/c start updater.exe\");",
    "File.WriteAllText(updateJsonPath, serializedJson);",
    "await client.DownloadFileTaskAsync(uri, outputPath);",
    "Dictionary<int, HashSet<int>> adjacencyGraph;",
    "foreach (var line in feederLines.Where(x => x.IsClosed))",
    "if (terminalEndpoints.All(x => x.RootBus == commonRootBus))",
    "Parallel.ForEach(simulationEvents, evt => RunSimulation(evt));",
    "RSAParameters publicKey = rsa.ExportParameters(false);",
    "SHA256.Create().ComputeHash(Encoding.UTF8.GetBytes(data));",
    "JsonSerializerSettings settings = new JsonSerializerSettings();",
    "using (MemoryStream ms = new MemoryStream(bytes))",
    "customerInterruptions = affectedLoads.Sum(x => x.CustomerCount);",
    "foreach (TreeNode node in treeView1.Nodes)",
    "DataTable table = new DataTable(\"ReliabilityResults\");",
    "Dictionary<int, List<int>> bfsTraversalMapping;",
    "var grouped = events.GroupBy(x => x.InterruptionType);",
    "using (SqlTransaction transaction = conn.BeginTransaction())",
    "FileSystemWatcher watcher = new FileSystemWatcher();",
    "Console.WriteLine($\"Voltage: {voltage:F2} p.u.\");",
    "Parallel.ForEach(loadBuses, bus => CalculateVoltageDrop(bus));",
    "List<Task> runningTasks = new List<Task>();",
    "await Task.WhenAll(runningTasks);",
    "CancellationTokenSource cts = new CancellationTokenSource();",
    "HttpClient client = new HttpClient();"
];

export const CSHARP_SNIPPETS: CodeSnippet[] = [
  { id: '1', title: 'Hello World', difficulty: 'EASY', language: 'csharp', code: 'Console.WriteLine("Hello, World!");' },
  { id: '2', title: 'Variables', difficulty: 'EASY', language: 'csharp', code: 'int number = 10;\nstring name = "C#";' },
  { id: '3', title: 'Conditionals', difficulty: 'EASY', language: 'csharp', code: 'if (x > 0) { Console.WriteLine("Positive"); }' },
  { id: '4', title: 'Loops', difficulty: 'EASY', language: 'csharp', code: 'for (int i = 0; i < 5; i++) { Console.WriteLine(i); }' },
  { id: '5', title: 'Lists', difficulty: 'MEDIUM', language: 'csharp', code: 'List<string> items = new List<string> { "A", "B", "C" };' },
  { id: '6', title: 'TryCatch', difficulty: 'MEDIUM', language: 'csharp', code: 'try { DoAction(); } catch (Exception ex) { Console.WriteLine(ex.Message); }' },
  { id: '7', title: 'LINQ', difficulty: 'MEDIUM', language: 'csharp', code: 'var evenNumbers = nums.Where(n => n % 2 == 0).ToList();' },
  { id: '8', title: 'AsyncTask', difficulty: 'MEDIUM', language: 'csharp', code: 'public async Task<string> GetDataAsync() { return await client.GetStringAsync(url); }' },
  { id: '9', title: 'Delegates', difficulty: 'HARD', language: 'csharp', code: 'public delegate void ActionHandler(string msg);\nActionHandler handler = (m) => Console.WriteLine(m);' },
  { id: '10', title: 'Reflection', difficulty: 'HARD', language: 'csharp', code: 'var type = typeof(MyClass);\nvar method = type.GetMethod("Execute");\nmethod.Invoke(instance, null);' },
  { id: '11', title: 'DependencyInjection', difficulty: 'HARD', language: 'csharp', code: 'public class MyController : ControllerBase\n{\n    private readonly IService _service;\n    public MyController(IService service) => _service = service;\n}' },
  { id: '12', title: 'ExpressionTree', difficulty: 'HARD', language: 'csharp', code: 'Expression<Func<User, bool>> isAdult = u => u.Age >= 18;' }
];
