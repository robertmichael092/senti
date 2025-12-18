from kivy.core.window import Window
Window.softinput_mode = "resize"

import sqlite3
from datetime import datetime
from calendar import month_name
from kivy.app import App
from kivy.lang import Builder
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.properties import StringProperty, NumericProperty, BooleanProperty
from kivy.clock import Clock

DB_NAME = "senti.db"

KV = """
#:set GREEN 0.117, 0.498, 0.361, 1
#:set RED 0.776, 0.353, 0.290, 1
#:set BG 0.969, 0.973, 0.965, 1
#:set TEXT 0.110, 0.110, 0.110, 1
#:set SUBTEXT 0.420, 0.420, 0.420, 1

ScreenManager:
    HomeScreen:
    YearScreen:
    AddEntryScreen:

<HomeScreen>:
    name: "home"

    BoxLayout:
        orientation: "vertical"
        padding: 20
        spacing: 24
        canvas.before:
            Color:
                rgba: BG
            Rectangle:
                size: self.size
                pos: self.pos

        BoxLayout:
            size_hint_y: None
            height: "40dp"

            Label:
                text: "Senti"
                font_size: "24sp"
                bold: True
                color: TEXT

            Button:
                text: "This Month"
                size_hint_x: None
                width: "100dp"
                opacity: 1 if root.show_reset else 0
                disabled: not root.show_reset
                background_color: 0,0,0,0
                color: GREEN
                on_press: app.reset_to_current_month()

            Button:
                text: "Year"
                size_hint_x: None
                width: "64dp"
                background_color: 0,0,0,0
                color: SUBTEXT
                on_press: app.root.current = "year"

        Label:
            text: root.month_label
            font_size: "14sp"
            color: SUBTEXT
            size_hint_y: None
            height: "20dp"

        Label:
            text: root.balance_text
            font_size: "30sp"
            bold: True
            color: GREEN if root.balance >= 0 else TEXT
            size_hint_y: None
            height: "40dp"

        BoxLayout:
            spacing: 24
            size_hint_y: None
            height: "72dp"

            BoxLayout:
                orientation: "vertical"
                Label:
                    text: "Money In"
                    font_size: "14sp"
                    color: SUBTEXT
                Label:
                    text: root.income_text
                    font_size: "20sp"
                    color: GREEN

            BoxLayout:
                orientation: "vertical"
                Label:
                    text: "Money Out"
                    font_size: "14sp"
                    color: SUBTEXT
                Label:
                    text: root.expense_text
                    font_size: "20sp"
                    color: RED

        BoxLayout:
            orientation: "vertical"
            spacing: 12

            Label:
                text: "Where your money went"
                font_size: "16sp"
                color: TEXT
                size_hint_y: None
                height: "28dp"

            BoxLayout:
                id: category_box
                orientation: "vertical"
                spacing: 8

        Widget:

        Button:
            text: "+ Add Entry"
            size_hint_y: None
            height: "52dp"
            background_color: GREEN
            color: 1,1,1,1
            on_press: app.root.current = "add"

<YearScreen>:
    name: "year"

    BoxLayout:
        orientation: "vertical"
        padding: 20
        spacing: 16
        canvas.before:
            Color:
                rgba: BG
            Rectangle:
                size: self.size
                pos: self.pos

        BoxLayout:
            size_hint_y: None
            height: "40dp"

            Button:
                text: "< Home"
                background_color: 0,0,0,0
                color: GREEN
                on_press: app.reset_to_current_month()

            Label:
                text: "This Year"
                font_size: "18sp"
                color: TEXT

        ScrollView:
            do_scroll_x: False

            BoxLayout:
                id: months_box
                orientation: "vertical"
                spacing: 12
                size_hint_y: None
                height: self.minimum_height

<AddEntryScreen>:
    name: "add"

    ScrollView:
        do_scroll_x: False

        BoxLayout:
            orientation: "vertical"
            padding: 20
            spacing: 16
            size_hint_y: None
            height: self.minimum_height
            canvas.before:
                Color:
                    rgba: BG
                Rectangle:
                    size: self.size
                    pos: self.pos

            Label:
                text: "Add Entry"
                font_size: "20sp"
                color: TEXT
                size_hint_y: None
                height: "40dp"

            Spinner:
                id: entry_type
                text: "out"
                values: ["in", "out"]
                size_hint_y: None
                height: "44dp"

            TextInput:
                id: amount
                hint_text: "Amount"
                input_filter: "float"
                multiline: False
                size_hint_y: None
                height: "44dp"

            TextInput:
                id: category
                hint_text: "Category"
                multiline: False
                size_hint_y: None
                height: "44dp"

            TextInput:
                id: note
                hint_text: "Note (optional)"
                multiline: False
                size_hint_y: None
                height: "44dp"

            Button:
                text: "Save"
                size_hint_y: None
                height: "48dp"
                background_color: GREEN
                color: 1,1,1,1
                on_press: root.save_entry()

            Button:
                text: "Cancel"
                size_hint_y: None
                height: "48dp"
                background_color: 0,0,0,0
                color: SUBTEXT
                on_press: app.reset_to_current_month()

            Widget:
                size_hint_y: None
                height: "120dp"
"""

class HomeScreen(Screen):
    income = NumericProperty(0)
    expense = NumericProperty(0)
    balance = NumericProperty(0)

    income_text = StringProperty("0")
    expense_text = StringProperty("0")
    balance_text = StringProperty("0")
    month_label = StringProperty("")
    show_reset = BooleanProperty(False)

    current_month = StringProperty(datetime.now().strftime("%Y-%m"))

    def on_enter(self):
        Clock.schedule_once(self.refresh, 0)

    def refresh(self, dt):
        self.update_state()
        self.update_summary()
        self.update_categories()

    def update_state(self):
        self.show_reset = self.current_month != datetime.now().strftime("%Y-%m")

    def update_summary(self):
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("""
            SELECT
                SUM(CASE WHEN type='in' THEN amount ELSE 0 END),
                SUM(CASE WHEN type='out' THEN amount ELSE 0 END)
            FROM entries WHERE date LIKE ?
        """, (self.current_month + "%",))
        i, o = c.fetchone()
        conn.close()

        self.income = i or 0
        self.expense = o or 0
        self.balance = self.income - self.expense

        y, m = self.current_month.split("-")
        self.month_label = f"{month_name[int(m)]} {y}"

        self.income_text = f"{int(self.income):,}"
        self.expense_text = f"{int(self.expense):,}"
        self.balance_text = f"{int(self.balance):,}"

    def update_categories(self):
        box = self.ids.category_box
        box.clear_widgets()

        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("""
            SELECT category, SUM(amount)
            FROM entries
            WHERE type='out' AND date LIKE ? AND category != ''
            GROUP BY category ORDER BY SUM(amount) DESC LIMIT 3
        """, (self.current_month + "%",))
        rows = c.fetchall()
        conn.close()

        if not rows:
            box.add_widget(Builder.load_string(
                "Label:\n text: 'No expense data yet'\n color: SUBTEXT"
            ))
            return

        for cat, total in rows:
            box.add_widget(Builder.load_string(f"""
BoxLayout:
    size_hint_y: None
    height: "28dp"
    Label:
        text: "{cat}"
        color: TEXT
    Label:
        text: "{int(total):,}"
        color: TEXT
        halign: "right"
"""))

class YearScreen(Screen):
    def on_enter(self):
        Clock.schedule_once(self.load_year, 0)

    def load_year(self, dt):
        box = self.ids.months_box
        box.clear_widgets()

        y = datetime.now().year
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()

        for m in range(1, 13):
            ym = f"{y}-{m:02d}"
            c.execute("""
                SELECT
                    SUM(CASE WHEN type='in' THEN amount ELSE 0 END),
                    SUM(CASE WHEN type='out' THEN amount ELSE 0 END)
                FROM entries WHERE date LIKE ?
            """, (ym + "%",))
            i, o = c.fetchone()
            i, o = i or 0, o or 0
            b = i - o

            box.add_widget(Builder.load_string(f"""
Button:
    size_hint_y: None
    height: "56dp"
    background_color: 0,0,0,0
    on_press: app.select_month("{ym}")
    BoxLayout:
        orientation: "vertical"
        Label:
            text: "{month_name[m]}"
            color: TEXT
        Label:
            text: "In {int(i):,}  Out {int(o):,}  Bal {int(b):,}"
            color: SUBTEXT
"""))

        conn.close()

class AddEntryScreen(Screen):
    def save_entry(self):
        if not self.ids.amount.text:
            return

        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("""
            INSERT INTO entries (type, amount, category, date, note, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            self.ids.entry_type.text,
            float(self.ids.amount.text),
            self.ids.category.text,
            datetime.now().strftime("%Y-%m-%d"),
            self.ids.note.text,
            datetime.now().isoformat()
        ))
        conn.commit()
        conn.close()

        self.ids.amount.text = ""
        self.ids.category.text = ""
        self.ids.note.text = ""

        App.get_running_app().reset_to_current_month()

class SentiApp(App):
    def build(self):
        self.init_db()
        return Builder.load_string(KV)

    def select_month(self, ym):
        self.root.get_screen("home").current_month = ym
        self.root.current = "home"

    def reset_to_current_month(self):
        self.root.get_screen("home").current_month = datetime.now().strftime("%Y-%m")
        self.root.current = "home"

    def init_db(self):
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT,
                amount REAL,
                category TEXT,
                date TEXT,
                note TEXT,
                created_at TEXT
            )
        """)
        conn.commit()
        conn.close()

if __name__ == "__main__":
    SentiApp().run()